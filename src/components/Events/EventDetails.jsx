import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import Modal from "../UI/Modal.jsx";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchEvent, deleteEvent, queryClient } from "../../Utill/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState();

  const params = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  const {
    mutate,
    isPending: isPendingDeleting,
    isError: isErrorDeleting,
    error: errorDeleting,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      // מראה לי ישר את השינויים שנעשו שזה מחיקת פריט אחד
      queryClient.invalidateQueries({
        queryKey: ["events", params.id],
        refetchType: "none", // מוודא שרק בריצה הבאה זה ירוץ שוב ,ולא אוטומטית כל פעם
      }); // בודק האם כל הערכים תחת המפתח אבנטס הצליחו להמחק משרת
      navigate("/events");
    },
  });

  function handleDelete() {
    mutate({ id: params.id });
  }

  function handleStartDeleting() {
    setIsDeleting(true);
  }

  function handleStopDeleting() {
    setIsDeleting(false);
  }

  let content;

  if (isPending) {
    content = (
      <div id="event-details-content" className="center">
        <p>Fetching event data...</p>
      </div>
    );
  }

  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title={"Falied to load event."}
          message={
            error.info?.message ||
            "Falied to fetch event data, please try again later"
          }
        />
      </div>
    );
  }

  if (data) {
    const formatDate = new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDeleting}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formatDate} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDeleting}>
          <h2>Are you shore?</h2>
          <p>
            Do you really want to delete this event? This action cannot be
            uddone.
          </p>
          <div className="form-actoins">
            {isPendingDeleting && <p>Deleting, Please wait...</p>}
            {!isPendingDeleting && (
              <>
                <button onClick={handleStopDeleting} className="button-text">
                  Cancel
                </button>
                <button onClick={handleDelete} className="button">
                  Delete
                </button>
              </>
            )}
          </div>
          {isErrorDeleting && (
            <ErrorBlock
              title={"Failed to delete event"}
              message={
                errorDeleting.info?.message ||
                " Failed to delete event, please try again later."
              }
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
