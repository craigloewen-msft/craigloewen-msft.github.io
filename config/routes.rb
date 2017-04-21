Rails.application.routes.draw do
  get 'page_controller/testPage'

  get 'page_controller/homePage'
  get 'spot-me', to: 'page_controller#homePage'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'page_controller#homePage'
end
