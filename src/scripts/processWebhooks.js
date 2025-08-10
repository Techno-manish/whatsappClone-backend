require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");
const DatabaseConfig = require("../config/database");
const MessageService = require("../services/MessageService");

class WebhookProcessor {
  constructor() {
    this.messageService = new MessageService();
    this.database = new DatabaseConfig();
  }

  async processPayloadFiles(directoryPath) {
    try {
      await this.database.connect();

      const files = await fs.readdir(directoryPath);
      const jsonFiles = files.filter((file) => file.endsWith(".json"));

      console.log(`📁 Found ${jsonFiles.length} JSON files to process`);

      for (const file of jsonFiles) {
        try {
          const filePath = path.join(directoryPath, file);
          const fileContent = await fs.readFile(filePath, "utf8");
          const payload = JSON.parse(fileContent);

          console.log(`🔄 Processing ${file}...`);

          const result = await this.messageService.processWebhookPayload(
            payload
          );

          if (result) {
            console.log(`✅ Successfully processed ${file}`);
            console.log(`   Message ID: ${result.messageId}`);
            console.log(`   Contact: ${result.contactName} (${result.waId})`);
            console.log(
              `   Type: ${result.isFromBusiness ? "Outbound" : "Inbound"}`
            );
            console.log(`   Status: ${result.status}`);
          } else {
            console.log(`⚠️  No processable data in ${file}`);
          }
        } catch (fileError) {
          console.error(`❌ Error processing ${file}:`, fileError.message);
        }

        console.log("---");
      }

      console.log("🎉 All files processed!");
    } catch (error) {
      console.error("❌ Processing error:", error);
    } finally {
      await this.database.disconnect();
    }
  }
}

// Run the processor if called directly
if (require.main === module) {
  const processor = new WebhookProcessor();
  const webhookDirectory = process.argv[2] || "./webhook_samples";

  processor.processPayloadFiles(webhookDirectory);
}

module.exports = WebhookProcessor;
