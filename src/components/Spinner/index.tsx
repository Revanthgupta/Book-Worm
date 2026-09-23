interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};

const Spinner = ({ size = 'md', className = '' }: SpinnerProps) => (
  <div
    role="status"
    aria-label="Loading"
    className={`inline-block rounded-full border-bw-border border-t-bw-primary animate-spin ${sizeMap[size]} ${className}`}
  />
);

export default Spinner;
