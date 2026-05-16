import { ImageResponse } from "next/og"

export const size = { width: 512, height: 512 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4A154B",
          borderRadius: 96,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            width: 280,
            height: 280,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              margin: 10,
              borderRadius: 28,
              background: "#E01E5A",
            }}
          />
          <div
            style={{
              width: 120,
              height: 120,
              margin: 10,
              borderRadius: 28,
              background: "#36C5F0",
            }}
          />
          <div
            style={{
              width: 120,
              height: 120,
              margin: 10,
              borderRadius: 28,
              background: "#2EB67D",
            }}
          />
          <div
            style={{
              width: 120,
              height: 120,
              margin: 10,
              borderRadius: 28,
              background: "#ECB22E",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  )
}
