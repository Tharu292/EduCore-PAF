import { uploadImages } from "../services/ticketService";

function UploadImages({ ticketId }) {

  const handleUpload = async (e) => {
    const formData = new FormData();

    for (let file of e.target.files) {
      formData.append("files", file);
    }

    formData.append("user", "user1");

    await uploadImages(ticketId, formData);
  };

  return (
    <input type="file" multiple onChange={handleUpload} />
  );
}

export default UploadImages;