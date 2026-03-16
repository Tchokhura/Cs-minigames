import MapPicker from "@/components/MapPicker";
import { competitiveMaps } from "@/lib/maps";

export default function CompetitivePage() {
  return (
    <MapPicker
      pageTitle="CS2 Competitive Picker"
      heading="CS2 Competitive Picker"
      description="Spin the wheel or eliminate maps until only one remains."
      maps={competitiveMaps}
      fallbackImage="/images/Train.png"
      initialRemainingCount={14}
      availableTitle="Available Maps"
      availableDescription="Choose which maps should be included before spinning."
      randomResultText="A random map will appear here."
      eliminationResultText="Each spin removes one map until only one remains."
      selectedRoundText="Selected map for this round."
      resultAlt="Selected map image"
    />
  );
}
