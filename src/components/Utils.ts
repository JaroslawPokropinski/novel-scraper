import axios from "axios";
import { createWriteStream } from "fs";

export default class Utils {
  static async downloadImage(url: string, path: string) {
    const writer = createWriteStream(path);

    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  }
}
