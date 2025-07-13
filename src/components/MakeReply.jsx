import { useForm } from "react-hook-form";
import { useReplies } from "../hooks/waves/useReplies";
import { motion } from "framer-motion";
import { useCreateReply } from "../hooks/waves/useCreateReply";
import { toast } from "react-toastify";
import { useContext, useState } from "react";
import { UserContext } from "../contexts/userContext";
import Button from "./Button";

export default function MakeReply({ wid, onCloseReviewForm }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { user } = useContext(UserContext);
  const { data: replies = [], isLoading, error } = useReplies(wid);
  const { mutate } = useCreateReply(wid, user.uid, user.pseudo);

  const onSubmit = (data) => {
    if (isLoading) {
      return;
    }
    mutate(data, {
      onSuccess: () => {
        toast.success("Votre réponse a été envoyée.");
        onCloseReviewForm();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
    reset();
  };

  return (
    <motion.form
      key={wid}
      className="absolute bg-gray-800 p-3 border border-gray-600 top-full z-1 mt-1 w-full rounded"
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <textarea
        {...register(`reply`)}
        placeholder="Votre réponse..."
        className="w-full border p-2 rounded outline-0 focus:border-2 focus:border-blue-600 text-sm"
      />
      <p className="text-center">
        <Button type="submit" value="Envoyer" />
      </p>
    </motion.form>
  );
}
