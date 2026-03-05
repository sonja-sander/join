import { Routes } from '@angular/router';
import { MainPage } from './main-page/main-page';
import { Imprint } from './imprint/imprint';
import { Privacy } from './privacy/privacy';
import { HelpPage } from './help-page/help-page';
import { Contacts } from './main-page/contacts/contacts';
import { AddTask } from './main-page/add-task/add-task';
import { Board } from './main-page/board/board';
import { Summary } from './main-page/summary/summary';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: MainPage },
  { path: 'summary', component: Summary, canActivate: [authGuard] },
  { path: 'add-task', component: AddTask, canActivate: [authGuard] },
  { path: 'board', component: Board, canActivate: [authGuard] },
  { path: 'contacts', component: Contacts, canActivate: [authGuard] },
  { path: 'imprint', component: Imprint },
  { path: 'privacy', component: Privacy },
  { path: 'help', component: HelpPage },
];
