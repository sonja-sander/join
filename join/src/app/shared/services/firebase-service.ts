import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Contact } from '../interfaces/contact';
import { Unsubscribe } from '@angular/fire/auth';
import { capitalizeFullname, setUserColor } from '../utilities/utils';

@Injectable({
  providedIn: 'root',
})
/**
 * FirebaseService
 *
 * Manages contact data stored in Firestore.
 * Handles real-time synchronization, creation,
 * updates, and deletion of contact documents.
 */
export class FirebaseService {
  firestore: Firestore = inject(Firestore);
  contacts: Array<Contact> = [];
  contactsVersion = 0;
  unsubCollection!: Unsubscribe;
  loading = true;

  constructor() {
    this.unsubCollection = this.subCollection();
  }

  /**
   * Subscribes to the contacts collection in Firestore.
   *
   * Listens for real-time updates and keeps
   * the local contacts array in sync.
   *
   * @returns The unsubscribe function for the listener
   */
  subCollection(): Unsubscribe {
    this.loading = true;

    const contactsQuery = query(
      this.getContactsRef(),
      where('isAvailable', '==', true),
      orderBy('name', 'asc'),
    );

    return onSnapshot(contactsQuery, (snapshot) => {
      this.contacts.length = 0;
      snapshot.forEach((contact) => {
        this.contacts.push(this.mapContactObj(contact.data(), contact.id));
      });

      this.loading = false;
      this.contactsVersion += 1;
    });
  }

  /**
   * Maps raw Firestore data to a Contact object.
   *
   * @param obj The raw Firestore document data
   * @param id The document identifier
   * @returns A mapped Contact object
   */
  mapContactObj(obj: any, id: string): Contact {
    return {
      id: id,
      name: capitalizeFullname(obj.name) || '',
      email: obj.email || '',
      phone: obj.phone || '',
      isAvailable: obj.isAvailable || false,
      userColor: obj.userColor ?? setUserColor(),
    };
  }

  /**
   * Deletes a document from the specified collection.
   *
   * @param colId The collection identifier
   * @param docId The document identifier
   * @returns A promise that resolves when deletion completes
   */
  async deleteDocument(colId: string, docId: string): Promise<void> {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch((err) => {
      console.log(err);
    });
  }

  /**
   * Updates a contact document in Firestore.
   *
   * @param item The contact to update
   * @param colId The collection identifier
   * @returns A promise that resolves when the update completes
   */
  async updateDocument(item: Contact, colId: string): Promise<void> {
    if (item.id) {
      const docRef = this.getSingleDocRef(colId, item.id);
      await updateDoc(docRef, this.getCleanJson(item))
        .catch((err) => {
          console.log(err);
        })
        .then();
    }
  }

  /**
   * Creates a clean JSON object from a contact.
   *
   * Used to remove unwanted properties before
   * sending data to Firestore.
   *
   * @param contact The contact to clean
   * @returns A plain JSON object representing the contact
   */
  getCleanJson(contact: Contact): {} {
    return {
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      isAvailable: contact.isAvailable,
      userColor: contact.userColor,
    };
  }

  /**
   * Adds a new contact document to Firestore.
   *
   * @param item The contact to add
   * @returns The created document ID or null if an error occurs
   */
  async addDocument(item: Contact): Promise<string | null> {
    try {
      const docRef = await addDoc(this.getContactsRef(), item);
      return docRef.id;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /**
   * Cleans up the Firestore subscription when the service is destroyed.
   *
   * @returns void
   */
  ngOnDestroy(): void {
    this.unsubCollection();
  }

  /**
   * Returns a reference to the contacts collection.
   *
   * @returns The Firestore collection reference
   */
  getContactsRef() {
    return collection(this.firestore, 'contacts');
  }

  /**
   * Returns a reference to a single document.
   *
   * @param colId The collection identifier
   * @param docId The document identifier
   * @returns The Firestore document reference
   */
  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}
