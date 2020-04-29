Gem::Specification.new do |s|
  s.name = 'spree_mercado_pago'
  s.version     = '4.1.0.0'
  s.summary     = 'Spree Plugin to integrate Mercado Pago'
  s.description = 'Integrate Mercado Pago with Spree'
  s.author      = "Lucas Javier Juarez"
  s.files       = `git ls-files -- {app,config,lib,test,spec,features}/*`.split("\n")
  s.homepage    = 'https://github.com/lucasruroken/spree_mercado_pago'
  s.email       = 'lucasjavierjuarez@hotmail.com'
  s.license     = 'MIT'

  s.add_dependency 'spree_core', '< 5'
  s.add_dependency 'rest-client', '~> 2.1'
  s.add_dependency 'mercadopago-sdk'

  s.add_dependency 'bootstrap-sass', '~> 3.4'
  s.add_dependency 'canonical-rails', '~> 0.2'
  s.add_dependency 'jquery-rails',    '~> 4.3'

  s.add_development_dependency 'capybara-accessible'

  s.test_files = Dir["spec/**/*"]
end
