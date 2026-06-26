import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

import { ENTRY_CONDITION_LABELS } from "~/server/db/schema";

type Entry = {
  id: number;
  timestamp: Date;
  condition: string;
  description: string | null;
  weightG: number | null;
  calories: number | null;
  estimationStatus: string;
  note: string | null;
  photoPath: string | null;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 28,
  },
  dayHeader: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#1d4ed8",
    marginTop: 18,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#bfdbfe",
  },
  entry: {
    marginBottom: 6,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 8,
    paddingRight: 8,
    backgroundColor: "#f8fafc",
  },
  entryHeader: {
    flexDirection: "row",
    marginBottom: 2,
  },
  time: {
    fontFamily: "Helvetica-Bold",
    width: 40,
    color: "#374151",
  },
  condition: {
    color: "#374151",
  },
  indent: {
    marginLeft: 40,
  },
  description: {
    marginLeft: 40,
    marginBottom: 2,
    color: "#111827",
  },
  metrics: {
    flexDirection: "row",
    marginLeft: 40,
    marginBottom: 2,
  },
  metricItem: {
    flexDirection: "row",
    marginRight: 20,
    alignItems: "center",
  },
  metricLabel: {
    color: "#6b7280",
    marginRight: 4,
  },
  metricValue: {
    marginRight: 4,
  },
  badge: {
    fontSize: 7,
    color: "#ffffff",
    backgroundColor: "#9ca3af",
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 3,
    paddingRight: 3,
  },
  badgeMesure: {
    backgroundColor: "#059669",
  },
  note: {
    marginLeft: 40,
    color: "#4b5563",
    fontFamily: "Helvetica-Oblique",
    marginBottom: 1,
  },
  photo: {
    marginLeft: 40,
    color: "#9ca3af",
    fontSize: 8,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 4,
  },
});

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function groupByDay(items: Entry[]): [string, Entry[]][] {
  const map = new Map<string, Entry[]>();
  for (const entry of items) {
    const d = new Date(entry.timestamp);
    const key = d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const list = map.get(key) ?? [];
    list.push(entry);
    map.set(key, list);
  }
  return Array.from(map.entries());
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type RapportPDFProps = {
  entries: Entry[];
  from: Date | null;
  to: Date | null;
};

export function RapportPDF({ entries: items, from, to }: RapportPDFProps) {
  const days = groupByDay(items);

  const periodLabel =
    from && to
      ? `Du ${from.toLocaleDateString("fr-FR")} au ${to.toLocaleDateString("fr-FR")}`
      : from
        ? `À partir du ${from.toLocaleDateString("fr-FR")}`
        : to
          ? `Jusqu'au ${to.toLocaleDateString("fr-FR")}`
          : "Historique complet";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Rapport alimentaire PACAL</Text>
        <Text style={styles.subtitle}>{periodLabel}</Text>

        {days.map(([day, dayEntries]) => (
          <View key={day}>
            <Text style={styles.dayHeader}>{capitalize(day)}</Text>

            {dayEntries.map((entry) => {
              const isMesure = entry.estimationStatus === "mesure";
              const conditionLabel =
                ENTRY_CONDITION_LABELS[
                  entry.condition as keyof typeof ENTRY_CONDITION_LABELS
                ] ?? entry.condition;

              return (
                <View key={entry.id} style={styles.entry}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.time}>
                      {formatTime(new Date(entry.timestamp))}
                    </Text>
                    <Text style={styles.condition}>{conditionLabel}</Text>
                  </View>

                  {entry.description ? (
                    <Text style={styles.description}>{entry.description}</Text>
                  ) : null}

                  {(entry.weightG != null || entry.calories != null) ? (
                    <View style={styles.metrics}>
                      {entry.weightG != null ? (
                        <View style={styles.metricItem}>
                          <Text style={styles.metricLabel}>Poids :</Text>
                          <Text style={styles.metricValue}>
                            {entry.weightG} g
                          </Text>
                          <Text
                            style={[
                              styles.badge,
                              isMesure ? styles.badgeMesure : {},
                            ]}
                          >
                            {isMesure ? "M" : "E"}
                          </Text>
                        </View>
                      ) : null}
                      {entry.calories != null ? (
                        <View style={styles.metricItem}>
                          <Text style={styles.metricLabel}>Calories :</Text>
                          <Text style={styles.metricValue}>
                            {entry.calories} kcal
                          </Text>
                          <Text
                            style={[
                              styles.badge,
                              isMesure ? styles.badgeMesure : {},
                            ]}
                          >
                            {isMesure ? "M" : "E"}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null}

                  {entry.note ? (
                    <Text style={styles.note}>{entry.note}</Text>
                  ) : null}

                  {entry.photoPath ? (
                    <Text style={styles.photo}>Photo jointe</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}

        <Text style={styles.footer}>
          Généré par PACAL le{" "}
          {new Date().toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </Page>
    </Document>
  );
}

export async function renderRapport(
  items: Entry[],
  from: Date | null,
  to: Date | null
): Promise<Buffer> {
  return renderToBuffer(
    <RapportPDF entries={items} from={from} to={to} />
  ) as Promise<Buffer>;
}
