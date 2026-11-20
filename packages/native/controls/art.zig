// Generated from the OpenBoa project and agent masters.
pub const Art = enum { openboa, meatball, sourdough, yogurt, kai_ready, sol_ready, kai_working, sol_working };
pub fn bytes(art: Art) []const u8 {
    return switch (art) {
        .openboa => @embedFile("art/openboa.png"),
        .meatball => @embedFile("art/meatball.png"),
        .sourdough => @embedFile("art/sourdough.png"),
        .yogurt => @embedFile("art/yogurt.png"),
        .kai_ready => @embedFile("art/kai_ready.png"),
        .sol_ready => @embedFile("art/sol_ready.png"),
        .kai_working => @embedFile("art/kai_working.png"),
        .sol_working => @embedFile("art/sol_working.png"),
    };
}
pub fn register(fx: anytype, id: u64, art: Art) !void {
    _ = try fx.registerImageBytes(id, bytes(art));
}
