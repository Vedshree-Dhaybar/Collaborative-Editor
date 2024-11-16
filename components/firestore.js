import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Saves a document to Firestore with structured content, lastEdited, and sharedWith fields.
 * @param {string} docId - The ID of the document.
 * @param {string} content - The content to save, formatted for Quill.
 * @param {Array} sharedWith - Array of objects with email and permission fields.
 */
export const saveDocument = async (docId, content) => {
  try {
    await setDoc(doc(db, "documents", docId), {
      content: content,
      lastEdited: serverTimestamp(),  // Use server timestamp for last edited time
    });
    console.log("Document saved!");
  } catch (error) {
    console.error("Error saving document:", error);
  }
};