import ExpoModulesCore

public class SystemUI: Module {

    func setUserInterfaceStyle(_ style: UIUserInterfaceStyle) {
        UIApplication.shared.windows.forEach({ window in
            window.overrideUserInterfaceStyle = style
        })
    }

    public func definition() -> ModuleDefinition {
        Name("SystemUI")

        AsyncFunction("setDark") {
            setUserInterfaceStyle(.dark)
        }.runOnQueue(.main)

        AsyncFunction("setLight") {
            setUserInterfaceStyle(.light)
        }.runOnQueue(.main)

        AsyncFunction("setSystem") {
            setUserInterfaceStyle(.unspecified)
        }.runOnQueue(.main)
    }

}
