interface ErrorMessageProps {
  message: string;
  className?: string;
}

const ErrorMessage = ({ message, className = '' }: ErrorMessageProps) => (
  <div
    role="alert"
    className={`rounded-lg bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 text-sm ${className}`}
  >
    {message}
  </div>
);

export default ErrorMessage;
