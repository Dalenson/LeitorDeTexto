import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { WebcamModule } from 'ngx-webcam'; // Importe o WebcamModule aqui
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent // Certifique-se de adicionar HomeComponent aqui
    ],
    imports: [
        BrowserModule,
        WebcamModule // Certifique-se de importar o WebcamModule aqui
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }