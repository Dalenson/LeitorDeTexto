import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Tesseract, { createWorker } from "tesseract.js";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit{
  @ViewChild('video')
  public video!: ElementRef;

  @ViewChild('canvas')
  public canvas!: ElementRef;

  public constructor() {}


  public ngAfterViewInit(): void {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: { exact: "environment" } // Isso especifica o uso da câmera traseira
        } 
      })
        .then(stream => {
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.play();
        })
        .catch(error => {
          console.error('Erro ao acessar a câmera: ', error);
        });
    }
  }

  public async captureText(): Promise<void> {
    const video = this.video.nativeElement;
    const canvas = this.canvas.nativeElement;

    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    this.binarizeImage(canvas, 128);

    this.applyGaussianBlur(context, canvas.width, canvas.height);

    const worker = await createWorker('por');
    (async () => {
      try{
      const { data: { text } } = await worker.recognize(canvas.toDataURL('image/jpeg'));
      alert(text);
      // await worker.terminate();
      }catch(error){
        alert(error)
      }
    })();
  }
// ----------------------------------------------------------------------------------------
  public binarizeImage(canvas: any, threshold: any) {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3; // Convertendo para escala de cinza
        const color = brightness > threshold ? 255 : 0; // Aplicando o limiar
        data[i] = color;
        data[i + 1] = color;
        data[i + 2] = color;
    }

    context.putImageData(imageData, 0, 0);
  }

  // ---------------------------------------------------------------------------------------
  private applyGaussianBlur(context: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;
  
    // Cria uma matriz de kernel para aplicar o desfoque gaussiano
    const kernel = [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1]
    ];
    const kernelWeight = 16;
  
    // Aplica o desfoque gaussiano
    for (let x = 1; x < width - 1; x++) {
      for (let y = 1; y < height - 1; y++) {
        let r = 0, g = 0, b = 0;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const index = ((y + dy) * width + (x + dx)) * 4;
            const weight = kernel[dx + 1][dy + 1];
            r += data[index] * weight;
            g += data[index + 1] * weight;
            b += data[index + 2] * weight;
          }
        }
        const index = (y * width + x) * 4;
        data[index] = r / kernelWeight;
        data[index + 1] = g / kernelWeight;
        data[index + 2] = b / kernelWeight;
      }
    }
  
    context.putImageData(imageData, 0, 0);
  }
}
