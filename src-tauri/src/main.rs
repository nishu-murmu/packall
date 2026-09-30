fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();

    // If CLI arguments are provided and user didn't request GUI mode, run CLI directly
    if !args.is_empty() && args[0] != "gui" && args[0] != "--gui" {
        packall_lib::cli::handle_cli(&args);
        return;
    }

    // Otherwise launch the full desktop GUI
    packall_lib::run();
}
