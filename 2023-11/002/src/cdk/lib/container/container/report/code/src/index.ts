import { SQSEvent } from "aws-lambda";
import { launch } from "puppeteer";
const validateUrl = (url: string) => {
  if (!url) {
    console.error("url is required");
    throw new Error("url is required");
  }
  if (!url.startsWith(process.env.ALLOWED_URL || "https://example.com/")) {
    console.error("invalid url");
    throw new Error("invalid url");
  }
};

export const handler = (event: SQSEvent) => {
  if (!event) {
    return {
      statusCode: 400,
      code: 1,
    };
  }

  if (!event.Records) {
    return {
      statusCode: 400,
      code: 2,
    };
  }

  if (event.Records.length === 0) {
    return {
      statusCode: 400,
      code: 3,
    };
  }

  if (!event.Records[0]) {
    return {
      statusCode: 400,
      code: 4,
    };
  }

  event.Records.forEach((record, i) => {
    console.log(record);
    const { body } = record;
    if (!body) {
      return {
        statusCode: 400,
        code: 5,
      };
    }
    const url = body;
    try {
      validateUrl(url);
    } catch (e) {
      console.error(e);
      return {
        statusCode: 400,
        code: 6,
      };
    }
    (async () => {
      const browser = await launch({
        headless: true,
        args: [
          "--disable-dev-shm-usage",
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-gpu",
          "--no-gpu",
          "--disable-default-apps",
          "--disable-translate",
          "--user-agent=mini-ctf-reporter/1.0",
          "--single-process",
        ],
      });
      const page = await browser.newPage();
      page.setCookie({
        name: "flag",
        value: process.env.FLAG || "flag{dummy}",
        domain: process.env.DOMAIN || "example.com",
      });
      await page.goto(url);
      await page.waitForTimeout(500);
      // save to /tmp
      await browser.close();
    })();
  });

  return {
    statusCode: 200,
    body: "ok",
  };
};
