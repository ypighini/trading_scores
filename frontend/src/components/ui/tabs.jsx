import React, { useState } from "react";

export function Tabs({ children, defaultValue = 0 }) {
  const [activeIndex, setActiveIndex] = useState(defaultValue);

  const tabsList = React.Children.toArray(children).filter(
    (child) => child.type.displayName === "TabsList"
  );
  const tabsContent = React.Children.toArray(children).filter(
    (child) => child.type.displayName === "TabsContent"
  );

  return (
    <div>
      {tabsList.map((list, i) =>
        React.cloneElement(list, { activeIndex, setActiveIndex, key: i })
      )}
      {tabsContent.map((content, i) =>
        React.cloneElement(content, { activeIndex, index: i, key: i })
      )}
    </div>
  );
}

export function TabsList({ children, activeIndex, setActiveIndex }) {
  return (
    <div className="flex border-b mb-4">
      {React.Children.map(children, (child, i) =>
        React.cloneElement(child, {
          isActive: i === activeIndex,
          onClick: () => setActiveIndex(i),
        })
      )}
    </div>
  );
}
TabsList.displayName = "TabsList";

export function TabsTrigger({ children, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 -mb-px border-b-2 ${
        isActive ? "border-blue-600 font-semibold text-blue-600" : "border-transparent text-gray-500"
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, activeIndex, index }) {
  if (activeIndex !== index) return null;
  return <div>{children}</div>;
}
TabsContent.displayName = "TabsContent";
