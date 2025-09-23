import React from "react";

/* Composant principal Tabs */
export function Tabs({ children, defaultValue = 0 }) {
  const [activeIndex, setActiveIndex] = React.useState(defaultValue);

  // On ne prend que les enfants de premier niveau correspondant aux TabsList et TabsContent
  const tabsList = React.Children.toArray(children).filter(
    (child) => child.type && child.type.displayName === "TabsList"
  );
  const tabsContent = React.Children.toArray(children).filter(
    (child) => child.type && child.type.displayName === "TabsContent"
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

/* TabsList : contient les onglets (Triggers) et éventuellement un élément à droite */
export function TabsList({ children, activeIndex, setActiveIndex, right, className = "" }) {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div className="flex">
        {React.Children.map(children, (child, i) =>
          React.cloneElement(child, {
            isActive: i === activeIndex,
            onClick: () => setActiveIndex(i),
            key: i,
          })
        )}
      </div>
      {right ? <div className="ml-4">{right}</div> : null}
    </div>
  );
}
TabsList.displayName = "TabsList";

/* TabsTrigger : un onglet cliquable */
export function TabsTrigger({ children, isActive, onClick, className = "" }) {
  const base = "px-4 py-2 -mb-px border-b-2";
  const activeBorder = isActive ? "border-blue-600" : "border-transparent";
  return (
    <button onClick={onClick} className={`${base} ${activeBorder} ${className}`}>
      {children}
    </button>
  );
}
TabsTrigger.displayName = "TabsTrigger";

/* TabsContent : affiché seulement si index === activeIndex */
export function TabsContent({ children, activeIndex, index }) {
  if (activeIndex !== index) return null;
  return <div>{children}</div>;
}
TabsContent.displayName = "TabsContent";
