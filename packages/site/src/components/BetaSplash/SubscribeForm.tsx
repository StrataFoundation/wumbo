import React from "react";
import { useForm } from "react-hook-form";
import MailchimpSubscribe, { EmailFormFields } from "react-mailchimp-subscribe";

const mailchimpUrl =
  "https://gmail.us6.list-manage.com/subscribe/post?u=e2bd2443577e9ea691c0243b6&amp;id=5abedf917c";

const SubscribeForm: React.FC<{
  onSubmit: (x: EmailFormFields) => void;
}> = ({ onSubmit }) => {
  const { register, handleSubmit, reset } = useForm();

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-row text-gray-900"
    >
      <input
        {...register("EMAIL")}
        required
        type="email"
        className="flex-grow px-4 py-2 mr-2 font-medium rounded-md form-input sm:flex-grow-0 sm:w-96"
      />
      <button type="submit" className="px-4 py-2 bg-green-300 rounded-md">
        Subscribe
      </button>
    </form>
  );
};

const IntergratedForm: React.FC = () => {
  const humanizeError = (e: string) => {
    if (e.includes("already subscribed")) {
      return "You're already subscribed";
    }

    if (e.includes("too many recent signup requests")) {
      return "To many recent attempts with this email, please try back later";
    }

    return e;
  };

  return (
    <MailchimpSubscribe
      url={mailchimpUrl}
      render={({ subscribe, status, message }) => (
        <div>
          <SubscribeForm onSubmit={subscribe} />
          <div className="h-6 mt-2 text-sm">
            {status === "sending" && <span>Sending...</span>}
            {status === "error" && (
              <span
                dangerouslySetInnerHTML={{
                  __html: humanizeError(message as string),
                }}
              />
            )}
            {status === "success" && (
              <span className="text-green-300">Subscribed!</span>
            )}
          </div>
        </div>
      )}
    ></MailchimpSubscribe>
  );
};

export default IntergratedForm;
