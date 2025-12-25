import { openDesign } from "@canva/design";
import { getTemporaryUrl } from "@canva/asset";

async function editTextAndDownloadVideo() {
  await openDesign({ type: "current_page" }, async (session) => {
    if (session.page.type !== "absolute" || session.page.locked) {
      console.error("Page is locked or not absolute type");
      return;
    }

    // Find the first video element (rect with video fill)
    const videoElement = session.page.elements.find(
      (el) =>
        el.type === "rect" &&
        el.fill?.mediaContainer?.type === "video" &&
        !el.locked
    );

    if (!videoElement) {
      console.error("No video element found on the page");
      return;
    }

    // Find a text element overlapping the video
    const textElement = session.page.elements.find(
      (el) =>
        el.type === "text" &&
        !el.locked &&
        el.top >= videoElement.top &&
        el.top < videoElement.top + videoElement.height &&
        el.left >= videoElement.left &&
        el.left < videoElement.left + videoElement.width
    );

    if (textElement) {
      // Update existing text element content
      const newText = session.helpers.elementStateBuilder.createRichtextRange();
      newText.appendText("Updated text on video");
      newText.formatParagraph(
        { index: 0, length: "Updated text on video".length },
        { fontSize: 36, color: "#FF0000", fontWeight: "bold", textAlign: "center" }
      );
      textElement.text = { regions: newText.readTextRegions() };
      await session.sync();
      console.log("Text element updated");
    } else {
      // Add a new text element on the video
      const { elementStateBuilder } = session.helpers;
      const newTextElement = elementStateBuilder.createTextElement({
        top: videoElement.top + 20,
        left: videoElement.left + 20,
        width: videoElement.width - 40,
        text: {
          regions: [
            {
              text: "New Text on Video",
              formatting: {
                fontSize: 36,
                color: "#FF0000",
                fontWeight: "bold",
                textAlign: "center",
              },
            },
          ],
        },
      });
      session.page.elements.insertAfter(videoElement, newTextElement);
      await session.sync();
      console.log("New text element added on top of video");
    }

    // Download the video asset
    // The video asset ref is in videoElement.fill.mediaContainer.ref
    const videoRef = videoElement.fill!.mediaContainer!.ref;

    const { url } = await getTemporaryUrl({
      type: "video",
      ref: videoRef,
    });

    console.log("Temporary video URL:", url);
  });
}

// Call the function (e.g., on button click)
editTextAndDownloadVideo().catch(console.error);
