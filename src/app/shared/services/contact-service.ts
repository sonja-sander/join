import { inject, Injectable, signal } from '@angular/core';
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
 * ContactService
 *
 * Manages contact data stored in Firestore.
 * Handles real-time synchronization, creation,
 * updates, and deletion of contact documents.
 */
export class ContactService {
  firestore: Firestore = inject(Firestore);

  contacts = signal<Array<Contact>>([]);
  loading = signal(true);

  unsubCollection!: Unsubscribe;

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
    this.loading.set(true);

    const contactsQuery = query(
      this.getContactsRef(),
      where('isAvailable', '==', true),
      orderBy('name', 'asc'),
    );

    return onSnapshot(contactsQuery, (snapshot) => {
      const loadedContacts: Array<Contact> = [];

      snapshot.forEach((contact) => {
        loadedContacts.push(this.mapContactObj(contact.data(), contact.id));
      });

      this.contacts.set(loadedContacts);
      this.loading.set(false);
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
      avatar: obj.avatar || null,
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
      await updateDoc(docRef, this.getCleanObj(item))
        .catch((err) => {
          console.log(err);
        })
        .then();
    }
  }

  /**
   * Creates a clean object from a contact.
   *
   * Used to remove unwanted properties before
   * sending data to Firestore.
   *
   * @param contact The contact to clean
   * @returns A plain object representing the contact
   */
  getCleanObj(contact: Contact): {} {
    return {
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      isAvailable: contact.isAvailable,
      userColor: contact.userColor,
      avatar: contact.avatar,
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
   * Retrieves a contact by its unique identifier.
   *
   * @param id The contact identifier
   * @returns The matching Contact object or undefined if not found
   */
  getContactById(id: string) {
    return this.contacts().find((contact) => contact.id === id);
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
