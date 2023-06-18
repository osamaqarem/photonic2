require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "UploadService"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]
  s.source       = { git: 'https://github.com/osamaqarem/Photonic.git' }
  s.platforms    = { :ios => "14.0" }

  s.dependency "React-Core"

  s.source_files = "source/**/*.{h,m,swift}"
end