import ExpoModulesCore

public class SystemUI: Module {
    public func definition() -> ModuleDefinition {
        Name("SystemUI")

        AsyncFunction("setMode") { (mode: ColorScheme, promise: Promise) in
            setUserInterfaceStyle(mode.toUIUserInterfaceStyle())
            promise.resolve()
        }.runOnQueue(.main)
    }

    func setUserInterfaceStyle(_ style: UIUserInterfaceStyle) {
        UIApplication.shared.windows.forEach({ window in
            window.overrideUserInterfaceStyle = style
        })
    }

    enum ColorScheme: String, Enumerable {
        case light
        case dark
        case system

        func toUIUserInterfaceStyle() -> UIUserInterfaceStyle {
            switch self {
            case .light:
                return .light
            case .dark:
                return .dark
            default:
                return .unspecified
            }
        }
    }
}
