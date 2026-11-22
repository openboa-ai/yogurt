import AppKit

let directory = URL(fileURLWithPath: CommandLine.arguments[1])
func capture(_ name: String) throws -> NSBitmapImageRep {
    let data = try Data(contentsOf: directory.appendingPathComponent(name + ".png"))
    guard let image = NSBitmapImageRep(data: data), image.pixelsWide == 480, image.pixelsHigh == 480 else {
        fatalError("Unexpected OTP fixture dimensions for \(name)")
    }
    return image
}

let idle = try capture("idle")
for name in ["click", "tab", "blur"] {
    let observed = try capture(name)
    // The fixed-width fixture puts the six-cell row at (0, 66.25).
    let changed = (60..<130).flatMap { y in
        (0..<336).compactMap { x in
            observed.colorAt(x: x, y: y) == idle.colorAt(x: x, y: y) ? nil : (x, y)
        }
    }
    if name == "blur" {
        precondition(changed.isEmpty, "The OTP did not return to its resting appearance")
    } else {
        precondition(observed.colorAt(x: 24, y: 90) != idle.colorAt(x: 24, y: 90), "First cell did not change on \(name)")
        precondition(changed.allSatisfy { x, y in x < 48 && (66..<123).contains(y) }, "Pixels outside the first cell changed on \(name)")
    }
    print("Verified OTP \(name)")
}
