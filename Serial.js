// enum ParityType {
//     "none",
//     "even",
//     "odd"
//   };

//   enum FlowControlType {
//     "none",
//     "hardware"
//   };

//   dictionary SerialOptions {
//     required [EnforceRange] unsigned long baudRate;
//     [EnforceRange] octet dataBits = 8;
//     [EnforceRange] octet stopBits = 1;
//     ParityType parity = "none";
//     [EnforceRange] unsigned long bufferSize = 255;
//     FlowControlType flowControl = "none";
//   };

// notes:
// done doesnt seem to ever be true?
// want to be able to specify pipelines of decoders
// ie linedecoder or just standard decoder

export class Serial {
  constructor(
    serialOptions = {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: "none",
      bufferSize: 255,
      flowControl: "none",
    },
    serialFilters = {}
  ) {
    this.serialOptions = serialOptions;
    this.serialFilters = serialFilters;

    this.EOF = "\n";
    this.port = null;

    this.encoder = new TextEncoderStream("utf-8");
    this.decoder = new TextDecoderStream("utf-8");
    this.lineTransformer = new TransformStream(new LineBreakTransformer());

    // port reads from encoder.readable, i write to encoder.writable
    this.writeToStream = this.encoder.writable;

    // port writes to decoder.writable, i read from decoder.readable
    this.readFromStream =
      this.EOF === "\n" ? this.lineTransformer.readable : this.decoder.readable;

    this.reader = null;
    this.writer = null;

    this.readFromPromise = null;
    this.writeToPromise = null;
  }

  async connect() {
    this.port = this.serialFilters
      ? await navigator.serial.requestPort(this.serialFilters)
      : await navigator.serial.requestPort();
    await this.port.open(this.serialOptions);

    // connect the port stream to the in and out stream
    // this.readFromPromise = this.port.readable.pipeTo(this.decoder.writable);
    this.readFromPromise = this.port.readable
      .pipeThrough(this.decoder)
      .pipeThrough(this.lineTransformer);
    this.writeToPromise = this.encoder.readable.pipeTo(this.port.writable);
  }

  async disconnect() {
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

  async write(cmd) {
    // spawn a new writer and lock to writeToStream
    const writer = this.writeToStream.getWriter();
    // write command and unlock
    writer.write(cmd + this.EOF);
    writer.releaseLock();
  }

  // mayne this should be a generator?
  async readLoop() {
    // while we can read from the port
    while (this.port.readable) {
      // lock the reader to the port stream
      const reader = this.readFromStream.getReader();

      try {
        while (true) {
          // await for values from the reader
          const { done, value } = await reader.read();
          // if no more values, break
          // FYI done seems to always return false...
          console.log(value);
          if (done === true) {
            console.log("breaking");
            break;
          }
        }
      } catch (e) {
        console.log("ERROR, ", e);
      } finally {
        console.log("unlocking reader");
        reader.releaseLock();
      }
    }
  }

  // test out the generator
  async *readLine() {
    while (this.port.readable) {
      const reader = this.readFromStream.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
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
        reader.releaseLock();
      }
    }
  }
}

class LineBreakTransformer {
  constructor() {
    this.container = "";
  }

  transform(chunk, controller) {
    this.container += chunk;
    const lines = this.container.split("\r\n");
    this.container = lines.pop();
    lines.forEach((line) => controller.enqueue(line));
  }

  flush(controller) {
    controller.enqueue(this.container);
  }
}
