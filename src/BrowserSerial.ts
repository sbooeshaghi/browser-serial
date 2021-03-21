// notes:
// done doesnt seem to ever be true?
// want to be able to specify pipelines of decoders
// ie linedecoder or just standard decoder


const defaultSerialOptions: SerialOptions = {
  baudRate: 115200,
  dataBits: 8,
  stopBits: 1,
  parity: "none",
  bufferSize: 255,
  flowControl: "none",
};

const defaultSerialFilters: SerialPortRequestOptions = {};

export class BrowserSerial {
  serialOptions: SerialOptions
  serialFilters: SerialPortRequestOptions
  port: SerialPort | null
  EOF: string
  encoder: TextEncoderStream
  decoder: TextDecoderStream
  lineTransformer: TransformStream
  writeToStream: WritableStream
  readFromStream: ReadableStream
  reader: ReadableStreamDefaultReader | null


  constructor(
    serialOptions = defaultSerialOptions,
    serialFilters = defaultSerialFilters
  ) {

    this.serialOptions = serialOptions;
    this.serialFilters = serialFilters;

    this.EOF = "\n";
    this.port = null;

    this.encoder = new TextEncoderStream();
    this.decoder = new TextDecoderStream("utf-8");
    this.lineTransformer = new TransformStream(new LineBreakTransformer());

    // port reads from encoder.readable, i write to encoder.writable
    this.writeToStream = this.encoder.writable;

    // port writes to decoder.writable, i read from decoder.readable
    this.readFromStream =
      this.EOF === "\n" ? this.lineTransformer.readable : this.decoder.readable;

    this.reader = null;
  }
  
  async connect(): Promise<void> {
    this.port = this.serialFilters
      ? await navigator.serial.requestPort(this.serialFilters)
      : await navigator.serial.requestPort();
      
    await this.port.open(this.serialOptions);

    // connect the port stream to the in and out stream
    // this.readFromPromise = this.port.readable.pipeTo(this.decoder.writable);
    this.port.readable
      .pipeThrough(this.decoder)
      .pipeThrough(this.lineTransformer);

    this.encoder.readable.pipeTo(this.port.writable);
  }

  
  // async setupDecoder(){
  //   this.decoder = new TextDecoderStream("utf-8");
  //   this.lineTransformer = new TransformStream(new LineBreakTransformer());
  //   // port writes to decoder.writable, i read from decoder.readable
  //   this.readFromStream =
  //     this.EOF === "\n" ? this.lineTransformer.readable : this.decoder.readable;
  // }
  // async setupEncoder() {
  //   this.encoder = new TextEncoderStream();
  //   // port reads from encoder.readable, i write to encoder.writable
  //   this.writeToStream = this.encoder.writable;
  // }
  // async setupStreams() {
  //   // connect the port stream to the in and out stream
  //   // this.readFromPromise = this.port.readable.pipeTo(this.decoder.writable);
  //   this.port.readable
  //     .pipeThrough(this.decoder)
  //     .pipeThrough(this.lineTransformer);

  //   this.encoder.readable.pipeTo(this.port.writable);
  // }
  

  async disconnect(): Promise<void> {
    if (this.reader) {
      // cancel the reader
      await this.reader.cancel();
      //   await this.inDone.catch(() => {});

      this.reader = null;
      //   this.inDone = null;
    }
    if (this.writeToStream) {
      // cancel the writer
      await this.writeToStream.getWriter().close();
      //   await this.outDone;
      this.writeToStream = null;
      //   this.outDone = null;
    }
    // close the port
    await this.port.close();
    this.port = null;
  }

  async write(cmd: string): Promise<void> {
    // spawn a new writer and lock to writeToStream
    const writer = this.writeToStream.getWriter();
    // write command and unlock
    writer.write(cmd + this.EOF);
    writer.releaseLock();
  }

  // mayne this should be a generator?
  async readLoop(callable: (value: string, done: boolean) => void): Promise<void> {
    // while we can read from the port
    while (this.port.readable) {
      // lock the reader to the port stream
      this.reader = this.readFromStream.getReader();

      try {
        while (true) {
          // await for values from the reader
          const { done, value } = await this.reader.read();
          // if no more values, break
          // FYI done seems to always return false...
          callable(value, done);
          if (done === true) {
            console.log("breaking");
            break;
          }
        }
      } catch (e) {
        console.log("ERROR, ", e);
      } finally {
        console.log("unlocking reader");
        this.reader.releaseLock();
      }
    }
  }

  // test out the generator
  async *readLine(): AsyncGenerator<{value: any;done: boolean;}, void, unknown> 
    {
    while (this.port.readable) {
      this.reader = this.readFromStream.getReader();
      try {
        while (true) {
          const { value, done } = await this.reader.read();
          yield { value, done };
          if (done === true) {
            console.log("breaking!");
            break;
          }
        }
      } catch (e) {
        console.log("ERROR, ", e);
      } finally {
        console.log("unlocking reader");
        this.reader.releaseLock();
      }
    }
  }
}

class LineBreakTransformer {
  container: string 

  constructor() {
    this.container = "";
  }

  transform(chunk: string, controller: TransformStreamDefaultController) {
    this.container += chunk;
    const lines = this.container.split("\r\n");
    let pop = lines.pop();
    this.container = "";
    if (pop){
      this.container = pop;
    }
    lines.forEach((line) => controller.enqueue(line));
  }

  flush(controller: TransformStreamDefaultController) {
    controller.enqueue(this.container);
  }
}
