import { Tabs } from "antd";
import UseActionState from "./components/UseActionState";
import UseCallback from "./components/UseCallback";
import UseContext from "./components/UseContext";
import UseDeferredValue from "./components/UseDeferredValue";

export default function Landing() {
  return (
    <Tabs
      items={[
        {
          key: "UseActionState",
          label: "UseActionState",
          children: <UseActionState />,
        },
        {
          key: "UseCallback",
          label: "UseCallback",
          children: <UseCallback />,
        },
        {
          key: "UseContext",
          label: "UseContext",
          children: <UseContext />,
        },
        {
          key: "UseDeferredValue",
          label: "UseDeferredValue",
          children: <UseDeferredValue />,
        },
      ]}
    />
  );
}
