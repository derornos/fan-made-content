import fs from "node:fs";
import path from "node:path";
import { Processor, type Mapper } from "./lib/post_process_helpers";

const projectsDir = path.join(process.cwd(), "projects");
const postProcessorsDir = path.join(import.meta.dirname, "post_processors");

async function processFiles() {
  const files = fs.readdirSync(projectsDir);

  for (const file of files) {
    if (file.endsWith(".json")) {
      const fileNameWithoutExt = path.basename(file, ".json");

      const cleanupFilePath = path.join(
        postProcessorsDir,
        `${fileNameWithoutExt}.ts`,
      );

      let mapper: Mapper | undefined = undefined;

      if (fs.existsSync(cleanupFilePath)) {
        mapper = (await import(cleanupFilePath)).default;
      }

      const cleaner = new Processor(fileNameWithoutExt, mapper);
      cleaner.run();
      console.log(`Processed: ${file}`);
    }
  }
}

await processFiles();
