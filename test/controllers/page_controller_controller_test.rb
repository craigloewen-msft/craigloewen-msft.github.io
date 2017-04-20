require 'test_helper'

class PageControllerControllerTest < ActionDispatch::IntegrationTest
  test "should get homePage" do
    get page_controller_homePage_url
    assert_response :success
  end

end
