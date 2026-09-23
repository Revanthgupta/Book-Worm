import type { Author } from '../../types/book';

interface WriterProfileProps {
  author: Author;
}

/** Returns the initials of a name (up to 2 characters). */
function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const WriterProfile = ({ author }: WriterProfileProps) => {
  // If there is no bio, hide the entire section per spec.
  if (!author.bio) return null;

  const hasPhoto = Boolean(author.photo);

  return (
    <section className="mt-10" aria-labelledby="writer-heading">
      <h2 id="writer-heading" className="text-lg font-normal mb-3">
        About the writer
      </h2>
      <div className="flex gap-6 items-start">
        {/* Avatar — circular, 128px */}
        {hasPhoto ? (
          <img
            src={author.photo}
            alt={`Photo of ${author.name}`}
            className="w-28 h-28 rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            className="w-30 h-30 rounded-full bg-field flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <span className="text-ink-soft text-lg font-semibold select-none">
              {initials(author.name)}
            </span>
          </div>
        )}

        {/* Writer info */}
        <div>
          <h3 className="text-lg font-normal mt-1">{author.name}</h3>
          <p className="text-xs text-ink-soft leading-relaxed mt-2 whitespace-pre-line">
            {author.bio}
          </p>
        </div>
      </div>
    </section>
  );
};

export default WriterProfile;
