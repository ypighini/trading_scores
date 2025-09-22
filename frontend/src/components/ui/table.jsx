import React from "react";

export function Table({ children, ...props }) {
  return (
    <table className="min-w-full border border-gray-300 text-sm" {...props}>
      {children}
    </table>
  );
}

export function TableHeader({ children, ...props }) {
  return (
    <thead className="bg-gray-100 text-left font-semibold" {...props}>
      {children}
    </thead>
  );
}

export function TableRow({ children, ...props }) {
  return (
    <tr className="border-b hover:bg-gray-50" {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ children, ...props }) {
  return (
    <th className="px-4 py-2 border-r last:border-r-0 cursor-pointer" {...props}>
      {children}
    </th>
  );
}

export function TableBody({ children, ...props }) {
  return <tbody {...props}>{children}</tbody>;
}

export function TableCell({ children, ...props }) {
  return (
    <td className="px-4 py-2 border-r last:border-r-0" {...props}>
      {children}
    </td>
  );
}
