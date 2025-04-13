import api from "./apiAdapter";

const fileAdapter = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  downloadFile: async (fileId) => {
    const { data } = await api.get(`/files/download/${fileId}`, {
      responseType: "blob", // For binary file downloads
    });
    return data;
  },

  deleteFile: async (fileId) => {
    const { data } = await api.delete(`/files/${fileId}`);
    return data;
  },

  listFiles: async () => {
    const { data } = await api.get("/files");
    return data;
  },
};

export default fileAdapter;
