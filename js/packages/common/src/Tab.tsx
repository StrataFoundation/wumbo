import React, { useState, ReactNode, ReactElement, ReactChild } from "react";

interface Props {
  children: ReactNode;
}

interface TabsProps extends Props {}

interface TabProps extends Props {
  selected?: boolean;
  title: string;
}

const style = {
  selected: `block w-full text-indigo-600 text-center border-b-2 border-indigo-600 -mb-2 px-4 text-md  py-4 md:py-1 inline-block cursor-default`,
  notSelected: `block w-full text-gray-300 -mb-2 px-4 text-md text-center py-4 md:py-1 inline-block border-b-2 border-gray-300 cursor-pointer`,
};

export const Tabs = ({ children }: TabsProps) => {
  const childrenArray: Array<any> = React.Children.toArray(children);
  const [current, setCurrent] = useState<ReactChild>(childrenArray[0].key);
  const newChildren = childrenArray.map((child) =>
    React.cloneElement(child as ReactElement, {
      selected: child.key === current,
    })
  );

  const className = (child: any, current: any) => {
    return current === child.key ? style.selected : style.notSelected;
  };

  return (
    <nav className="w-full">
      <div className="flex">
        {childrenArray.map((child) => (
          <div
            role="link"
            tabIndex={0}
            onClick={() => setCurrent(child.key)}
            key={child.key}
            className={`${className(child, current)} focus:outline-none`}
          >
            {child.props.title}
          </div>
        ))}
      </div>
      <section>{newChildren}</section>
    </nav>
  );
};

export const Tab = ({ children, selected }: TabProps) => (
  <div hidden={!selected} className="mt-4">
    {children}
  </div>
);
