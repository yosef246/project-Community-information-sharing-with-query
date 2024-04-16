import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createNewEvent } from "../../Utill/http.js";
import { queryClient } from "../../Utill/http.js";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function NewEvent() {
  const navigate = useNavigate();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createNewEvent,
    onSuccess: () => {
      //מראה לי ישר את השינויים שנעשו שזה הוספת פריט אחד
      queryClient.invalidateQueries({ queryKey: ["events"] }); // בודק האם כל הערכים תחת המפתח אבנטס הצליחו להתווסף לשרת
      navigate("/events"); //ורק אחר כך הוא מנווט לי לכתובת הנל
    },
  });

  function handleSubmit(formData) {
    mutate({ event: formData });
  }

  return (
    <Modal onClose={() => navigate("../")}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && "Submitting..."}
        {!isPending && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>
      {isError && (
        <ErrorBlock
          title="Failed to create event"
          message={
            error.info?.message ||
            "Failed to create event. Please check your inputs and try again later."
          }
        />
      )}
    </Modal>
  );
}
