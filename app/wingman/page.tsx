import MapPicker from "@/components/MapPicker";
import { wingmanMaps } from "@/lib/maps";

export default function WingmanPage() {
  return (
    <MapPicker
      pageTitle="CS2 Wingman Picker"
      heading="CS2 Wingman Picker"
      description="Spin the maps or eliminate them until one Wingman map remains."
      maps={wingmanMaps}
      fallbackImage="/images/Inferno.png"
      initialRemainingCount={6}
      availableTitle="Wingman Maps"
      availableDescription="Choose which Wingman maps should be included before spinning."
      randomResultText="A random Wingman map will appear here."
      eliminationResultText="Each spin removes one map until only one remains."
      selectedRoundText="Selected map for this round."
      resultAlt="Selected wingman map image"
    />
  );
}
