import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export const Button: React.FC<Props> = ({ variant = 'primary', className = '', ...rest }) => {
  const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
  const styles = variant === 'primary'
    ? 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500'
    : 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400';
  return <button className={`${base} ${styles} ${className}`} {...rest} />;
};
