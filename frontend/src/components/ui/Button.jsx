const SIZE = { sm: 'btn-sm', default: '', lg: 'btn-lg' };
const VARIANT = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  brass: 'btn-brass',
  live: 'btn-live',
};

export default function Button({ variant = 'primary', size = 'default', className = '', children, ...props }) {
  return (
    <button className={`btn ${VARIANT[variant] || ''} ${SIZE[size] || ''} ${className}`} {...props}>
      {children}
    </button>
  );
}
