import axiosInstance from "../axiosInstance";
let token: string | null = null;

if (typeof window !== "undefined") {
  token = localStorage.getItem("token");
}

export const deleteNote = async ({ noteId }: { noteId: string }) => {
  const { data } = await axiosInstance.delete(`/notes/delete-note/${noteId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};
