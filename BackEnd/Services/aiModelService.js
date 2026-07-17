const { spawn } = require("child_process");
const path = require("path");
const readline = require("readline");

class AIModelService {
  constructor() {
    this.pythonProcess = null;
    this.requestQueue = [];
    this.isProcessing = false;
    this.modelPath = path.join(__dirname, "..", "ai_models", "crop_prediction_model.py");
  }

  ensureStarted() {
    if (this.pythonProcess) return;

    console.log("Starting AI Prediction Model process...");
    this.pythonProcess = spawn("python", [this.modelPath]);

    const rl = readline.createInterface({
      input: this.pythonProcess.stdout,
      terminal: false
    });

    rl.on("line", (line) => {
      const output = line.trim();
      if (!output) return;
      if (this.requestQueue.length > 0) {
        const { resolve } = this.requestQueue.shift();
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          resolve({ error: "Failed to parse model output" });
        }
      }
      this.isProcessing = false;
      this.processQueue();
    });

    this.pythonProcess.stderr.on("data", (data) => {
      console.error(`AI Model stderr: ${data}`);
    });

    this.pythonProcess.on("error", (err) => {
      console.error("AI Model process error:", err);
      this.pythonProcess = null;
      this.isProcessing = false;
      while (this.requestQueue.length > 0) {
        this.requestQueue.shift().reject(err);
      }
    });

    this.pythonProcess.on("close", (code) => {
      console.log(`AI Model process exited with code ${code}`);
      this.pythonProcess = null;
      this.isProcessing = false;
      while (this.requestQueue.length > 0) {
        this.requestQueue.shift().reject(new Error("AI Model closed unexpectedly"));
      }
    });
  }

  async predict(input) {
    this.ensureStarted();

    return new Promise((resolve, reject) => {
      this.requestQueue.push({ input, resolve, reject });
      this.processQueue();
    });
  }

  processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;

    this.isProcessing = true;
    const { input } = this.requestQueue[0];
    this.pythonProcess.stdin.write(JSON.stringify(input) + "\n");
  }
}

module.exports = new AIModelService();
