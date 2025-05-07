import PDFDocument from "pdfkit";
import axios from "axios";
import sharp from "sharp";

export const generatePdf = async (
  date: string,
  topPosts: any[],
): Promise<Buffer> => {
  const pdfDoc = new PDFDocument({ margin: 50, size: "A4" });

  const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    pdfDoc.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
    pdfDoc.on("error", (error: Error) => reject(error));

    pdfDoc
      .fontSize(24)
      .text(`Top Reddit Posts Report ${date}`, { align: "center" });
    pdfDoc.moveDown();

    const pageHeight = pdfDoc.page.height;
    const marginBottom = 50;
    (async () => {
      for (const [index, post] of topPosts.entries()) {
        if (pdfDoc.y + 100 > pageHeight - marginBottom) {
          pdfDoc.addPage();
        }

        pdfDoc.fillColor("black");
        pdfDoc
          .font("Helvetica-Bold")
          .fontSize(12)
          .text(`${index + 1}. Title: `, { continued: true });
        pdfDoc.font("Helvetica").text(post.title);

        pdfDoc.font("Helvetica-Bold").text("   Votes: ", { continued: true });
        pdfDoc.font("Helvetica").text(post.score.toString());

        pdfDoc.font("Helvetica-Bold").text("   Link: ", { continued: true });
        pdfDoc.font("Helvetica").fillColor("blue").text(post.url, {
          link: post.url,
          underline: true,
        });
        pdfDoc.moveDown();

        // Add image if available
        if (post.images[0]?.source?.url) {
          try {
            const response = await axios.get(post.images[0].source.url, {
              responseType: "arraybuffer",
            });
            const imageBuffer = Buffer.from(response.data);

            const squareImageBuffer = await sharp(imageBuffer)
              .resize(250, 250, { fit: "contain" })
              .toBuffer();

            pdfDoc.image(squareImageBuffer, {
              fit: [500, 250],
              align: "center",
              valign: "center",
            });
            pdfDoc.moveDown();
          } catch (error) {
            logger.error("Failed to load image:", error);
          }
        }

        pdfDoc.moveDown();
      }
      pdfDoc.end();
    })();
  });

  return pdfBuffer;
};
