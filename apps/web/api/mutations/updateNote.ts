import axiosInstance from "../axiosInstance";
let token: string | null = null;

if (typeof window !== "undefined") {
  token = localStorage.getItem("token");
}

export const updateNote = async ({
  updatedNote,
  noteId,
}: {
  updatedNote: FormData;
  noteId: string;
}) => {
  const { data } = await axiosInstance.patch(
    `/notes/update/${noteId}`,
    updatedNote,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};

export const favNote = async ({ noteId }: { noteId: string }) => {
  const { data } = await axiosInstance.post(`/notes/fav/${noteId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return data;
};
