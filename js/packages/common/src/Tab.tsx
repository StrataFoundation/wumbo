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
  selected: `wum-block wum-w-full wum-text-indigo-600 wum-text-center wum-border-b-2 wum-border-indigo-600 wum--mb-2 wum-px-4 md:wum-px-8 wum-text-md wum- wum-py-4 md:wum-py-1 wum-inline-block wum-cursor-default`,
  notSelected: `wum-block wum-w-full wum-text-gray-300 wum--mb-2 wum-px-4 md:wum-px-8 wum-text-md wum-text-center wum-py-4 md:wum-py-1 wum-inline-block wum-border-b-2 wum-border-gray-300 wum-cursor-pointer`,
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
    <nav className="wum-w-full">
      <div className="wum-flex">
        {childrenArray.map((child) => (
          <div
            role="link"
            tabIndex={0}
            onClick={() => setCurrent(child.key)}
            key={child.key}
            className={`${className(child, current)} focus:wum-outline-none`}
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
  <div hidden={!selected} className="wum-mt-4">
    {children}
  </div>
);
