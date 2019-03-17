import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { CatchErrorInterceptor } from './interceptors/http-error.interceptor';

// Providers and services

import {
  ApiService,
  DialogService,
} from './services';

const services = [
  ApiService,
  DialogService,
];

// Modals in Services
import {
  ConfirmDialogModal,
} from './services';

// Components
import {
  ChartComponent,
  HourEditModal,
  HourImportModal,
  HourTableComponent,
  LoadingDotsComponent,
} from './components';
import { FormsModule } from '@angular/forms';

const components = [
  ConfirmDialogModal,
  ChartComponent,
  HourEditModal,
  HourImportModal,
  HourTableComponent,
  LoadingDotsComponent,
];

const entryComponents = [
  ConfirmDialogModal,
  HourEditModal,
  HourImportModal,
];


@NgModule({
  declarations: [
    AppComponent,
    ...components,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    NgbModule.forRoot(),
  ],
  providers: [
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CatchErrorInterceptor,
      multi: true,
    },
    ...services,
  ],
  entryComponents: [
    ...entryComponents,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
