import { useEffect, useState, useRef, type FormEvent } from "react";
import {
  Camera,
  Check,
  ImagePlus,
  MessageSquare,
  ShieldCheck,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { Astronaut, Modal, Vault } from "./Primitives";
export default function Checkin({
  open,
  onClose,
  onSubmit,
  done,
  streak,
  crew,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (note: string, photo: boolean) => void;
  done: boolean;
  streak: number;
  crew: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const honestRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"photo" | "note">("photo");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [honest, setHonest] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!file) {
      setUrl("");
      return;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  function submit(e: FormEvent) {
    e.preventDefault();
    if (mode === "photo" && !file) {
      setError("Add an everyday photo, or switch to a text check-in.");
      fileRef.current?.focus();
      return;
    }
    if (mode === "note" && !note.trim()) {
      setError("Write a quick note about your day.");
      noteRef.current?.focus();
      return;
    }
    if (!honest) {
      setError("Confirm your honest check-in to keep going.");
      honestRef.current?.focus();
      return;
    }
    setError("");
    onSubmit(
      note.trim() || "Still in. See you tomorrow.",
      !!file && mode === "photo",
    );
    setFile(null);
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={done ? "Another day. Locked in." : "Your daily “still in.”"}
      description={
        done
          ? "Small promise kept. That counts."
          : "A moment from your day. A little accountability with your crew."
      }
    >
      {done ? (
        <div className="checkin-success">
          <Vault days={streak} />
          <span className="pill mint">
            <Check size={14} /> Today’s task complete
          </span>
          <h3 className="display">{streak} days strong.</h3>
          <p>Your check-in is saved on this device. See you tomorrow.</p>
          <button className="button primary full" onClick={onClose}>
            Back to the crew <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="checkin-form">
          <div className="segmented">
            <button
              type="button"
              className={mode === "photo" ? "selected" : ""}
              onClick={() => {
                setMode("photo");
                setError("");
              }}
            >
              <Camera size={16} /> Photo
            </button>
            <button
              type="button"
              className={mode === "note" ? "selected" : ""}
              onClick={() => {
                setMode("note");
                setError("");
              }}
            >
              <MessageSquare size={16} /> Just a note
            </button>
          </div>
          {mode === "photo" && (
            <>
              <label className={`photo-picker ${url ? "has-photo" : ""}`}>
                {url ? (
                  <img
                    src={url}
                    width="420"
                    height="220"
                    alt="Your selected check-in preview"
                  />
                ) : (
                  <>
                    <span className="upload-icon">
                      <ImagePlus size={29} />
                    </span>
                    <strong>A little proof you showed up.</strong>
                    <span>
                      Your coffee, a walk, the view. Keep it everyday.
                    </span>
                    <span className="button secondary small">
                      Choose a photo
                    </span>
                  </>
                )}
                <input
                  ref={fileRef}
                  aria-invalid={
                    error.startsWith("Add") || error.startsWith("Choose")
                  }
                  aria-describedby={error ? "checkin-error" : undefined}
                  aria-label="Choose a check-in photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 8 * 1024 * 1024) {
                      setError("Choose a photo smaller than 8 MB.");
                      return;
                    }
                    if (
                      !["image/jpeg", "image/png", "image/webp"].includes(
                        f.type,
                      )
                    ) {
                      setError("Choose a JPG, PNG, or WebP image.");
                      return;
                    }
                    setFile(f);
                    e.target.value = "";
                    setError("");
                  }}
                />
              </label>
              {url && (
                <button
                  className="text-link"
                  type="button"
                  onClick={() => setFile(null)}
                >
                  <Trash2 size={15} /> Remove photo
                </button>
              )}
            </>
          )}
          <label className="field">
            {mode === "note" ? "Your check-in" : "Add a note (optional)"}
            <textarea
              ref={noteRef}
              aria-invalid={error.startsWith("Write")}
              aria-describedby={error ? "checkin-error" : undefined}
              name="note"
              placeholder="Still in. Went for a walk instead…"
              maxLength={280}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </label>
          <div className="audience">
            <Astronaut size={32} />
            <div>
              <strong>{crew}</strong>
              <span>Private crew · demo preview</span>
            </div>
            <ShieldCheck size={19} />
          </div>
          <p className="fineprint">
            Photos show participation, not proof of abstinence. This preview
            keeps your photo on this device for this session; nothing is
            uploaded.
          </p>
          <label className="checkbox-label">
            <input
              ref={honestRef}
              aria-invalid={error.startsWith("Confirm")}
              aria-describedby={error ? "checkin-error" : undefined}
              type="checkbox"
              checked={honest}
              onChange={(e) => setHonest(e.target.checked)}
            />{" "}
            I kept my promise today. This is an honest check-in.
          </label>
          {error && (
            <p className="error" id="checkin-error" role="alert">
              {error}
            </p>
          )}
          <button className="button primary full" type="submit">
            I’m still in <Check size={18} />
          </button>
        </form>
      )}
    </Modal>
  );
}
