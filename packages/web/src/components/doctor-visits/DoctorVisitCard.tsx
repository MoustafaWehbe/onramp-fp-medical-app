import type { EntryDoctorVisit } from "@/lib/doctor-visit-entries/doctor-visit-exports";

interface DoctorVisitCardProps {
visit: EntryDoctorVisit;
onClick?: () => void;
}

export function DoctorVisitCard({
visit,
onClick,
}: DoctorVisitCardProps) {
const doctorName = visit.userDoctor?.doctor?.name ?? "Unknown doctor";
const specialty = visit.userDoctor?.doctor?.specialty;
const clinicName = visit.userClinic?.clinic?.name;
const clinicAddress = visit.userClinic?.clinic?.address;

const formattedDate = new Date(
`${visit.entry.entryDate}T00:00:00`,
).toLocaleDateString("en-GB", {
day: "numeric",
month: "short",
year: "numeric",
});

return (
<article
className={`rounded-lg border bg-white p-4 shadow-sm ${
        onClick
          ? "cursor-pointer transition-shadow hover:shadow-md"
          : ""
      }`}
onClick={onClick}
role={onClick ? "button" : undefined}
tabIndex={onClick ? 0 : undefined}
onKeyDown={
onClick
? (event) => {
if (event.key === "Enter" || event.key === " ") {
event.preventDefault();
onClick();
}
}
: undefined
}
> <div className="flex items-start justify-between gap-4"> <div> <p className="text-sm text-muted-foreground">
{formattedDate} </p>

      <h3 className="mt-1 text-lg font-semibold">
        {doctorName}
      </h3>

      {specialty && (
        <p className="text-sm text-muted-foreground">
          {specialty}
        </p>
      )}
    </div>
  </div>

  {clinicName && (
    <div className="mt-4">
      <p className="text-sm font-medium">
        {clinicName}
      </p>

      {clinicAddress && (
        <p className="text-sm text-muted-foreground">
          {clinicAddress}
        </p>
      )}
    </div>
  )}

  {visit.summary && (
    <div className="mt-4">
      <p className="text-sm font-medium">Summary</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {visit.summary}
      </p>
    </div>
  )}
</article>


);
}
