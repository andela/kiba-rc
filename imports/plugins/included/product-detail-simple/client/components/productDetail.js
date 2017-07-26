import React, { Component, PropTypes } from "react";
import {
  Button,
  Currency,
  DropDownMenu,
  MenuItem,
  Translation,
  Toolbar,
  ToolbarGroup
} from "/imports/plugins/core/ui/client/components/";
import {
  AddToCartButton,
  ProductMetadata,
  ProductTags,
  ProductField
} from "./";
import { AlertContainer } from "/imports/plugins/core/ui/client/containers";
import { PublishContainer } from "/imports/plugins/core/revisions";
import "./firebase/firebaseApi";

class ProductDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDigital: false,
      downloadUrl: "",
      progressBar: false,
      progressLevel: 0
    };
    this.onDigitalChange = this.onDigitalChange.bind(this);
    this.isDigital = this.isDigital.bind(this);
    this.onDigitalSaveClick = this.onDigitalSaveClick.bind(this);
    this.fileUpload =  this.fileUpload.bind(this);
  }
  get tags() {
    return this.props.tags || [];
  }

  get product() {
    return this.props.product || {};
  }

  get editable() {
    return this.props.editable;
  }

  handleVisibilityChange = (event, isProductVisible) => {
    if (this.props.onProductFieldChange) {
      this.props.onProductFieldChange(this.product._id, "isVisible", isProductVisible);
    }
  }

  handlePublishActions = (event, action) => {
    if (action === "archive" && this.props.onDeleteProduct) {
      this.props.onDeleteProduct(this.product._id);
    }
  }

  componentDidMount() {
    const isDigital = this.props.product.isDigital;
    const downloadUrl = this.props.product.downloadUrl;
    if (isDigital) {
      document.getElementById("digital").checked = true;
      this.setState({ showDigital: true, downloadUrl });
    }

  }

  renderToolbar() {
    if (this.props.hasAdminPermission) {
      return (
        <Toolbar>
          <ToolbarGroup firstChild={true}>
            <Translation defaultValue="Product Management" i18nKey="productDetail.productManagement" />
          </ToolbarGroup>
          <ToolbarGroup>
            <DropDownMenu
              buttonElement={<Button label="Switch" />}
              onChange={this.props.onViewContextChange}
              value={this.props.viewAs}
            >
              <MenuItem label="Administrator" value="administrator" />
              <MenuItem label="Customer" value="customer" />
            </DropDownMenu>
          </ToolbarGroup>
          <ToolbarGroup lastChild={true}>
            <PublishContainer
              documentIds={[this.product._id]}
              documents={[this.product]}
              onVisibilityChange={this.handleVisibilityChange}
              onAction={this.handlePublishActions}
            />
          </ToolbarGroup>
        </Toolbar>
      );
    }

    return null;
  }
  isDigital() {
    const isChecked =  document.getElementById("digital").checked;
    if (isChecked) {
      this.setState({ showDigital: true });
    } else {
      this.setState({ showDigital: false });
      this.props.onProductFieldChange(this.product._id, "isDigital", false);
      this.props.onProductFieldChange(this.product._id, "downloadUrl", '');
    }
  }

  onDigitalSaveClick() {
    if (this.state.downloadUrl == '') {
      Alerts.toast("Enter download link", "error");
    } else {
      this.props.onProductFieldChange(this.product._id, "downloadUrl", this.state.downloadUrl);
      this.props.onProductFieldChange(this.product._id, "isDigital", true);
      document.getElementById('digital').checked = true;
      Alerts.toast("Download Link successfully saved", "success");
    }
  }
  onDigitalChange(e) {
    this.setState({ downloadUrl: e.target.value });
  }

  fileUpload() {
    const file = document.getElementById("file").files[0];
    if (!file) {
      Alerts.toast("Select a file", "error");
      return;
    }
    if (file.size / 1000000 > 100) {
      Alerts.toast("File size more than 100 MB", "error");
      return;
    }
    $(".save").prop("disabled", true);
    const fileName = file.name;
    const storageRef = firebase.storage().ref("files");
    const spaceRef = storageRef.child(fileName);
    const uploadTask = spaceRef.put(file);
    Alerts.toast("Uploading File...", "success");
    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      this.setState({ progressLevel: progress });
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          console.log('Upload is paused');
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          this.setState({ progressBar: true });
          break;
      }
    }, function(error) {
      Alerts.toast("Error in uploading file", "error");
    }, () => {
      const downloadURL = uploadTask.snapshot.downloadURL;
      Alerts.toast("Uploading Completed", "success");
      $("#file").val("");
      $(".save").prop("disabled", false);
      this.setState({ downloadUrl: downloadURL, progressBar: false });
      this.onDigitalSaveClick();
    });
  }

  render() {
    return (
      <div className="" style={{ position: "relative" }}>
        {this.renderToolbar()}

        <div className="container-main container-fluid pdp-container" itemScope itemType="http://schema.org/Product">
          <AlertContainer placement="productManagement" />

          <header className="pdp header">
            <ProductField
              editable={this.editable}
              fieldName="title"
              fieldTitle="Title"
              element={<h1 />}
              onProductFieldChange={this.props.onProductFieldChange}
              product={this.product}
              textFieldProps={{
                i18nKeyPlaceholder: "productDetailEdit.title",
                placeholder: "Title"
              }}
            />

            <ProductField
              editable={this.editable}
              fieldName="pageTitle"
              fieldTitle="Sub Title"
              element={<h2 />}
              onProductFieldChange={this.props.onProductFieldChange}
              product={this.product}
              textFieldProps={{
                i18nKeyPlaceholder: "productDetailEdit.pageTitle",
                placeholder: "Subtitle"
              }}
            />
          </header>


          <div className="pdp-content">
            <div className="pdp column left pdp-left-column">
              {this.props.mediaGalleryComponent}
              <ProductTags editable={this.props.editable} product={this.product} tags={this.tags} />
              <ProductMetadata editable={this.props.editable} product={this.product} />
            </div>

            <div className="pdp column right pdp-right-column">


              <div className="pricing">
                <div className="left">
                  <span className="price">
                    <span id="price">
                      <Currency amount={this.props.priceRange} />
                    </span>
                  </span>
                </div>
                <div className="right">
                  {this.props.socialComponent}
                </div>
              </div>


              <div className="vendor">
                <ProductField
                  editable={this.editable}
                  fieldName="vendor"
                  fieldTitle="Vendor"
                  onProductFieldChange={this.props.onProductFieldChange}
                  product={this.product}
                  textFieldProps={{
                    i18nKeyPlaceholder: "productDetailEdit.vendor",
                    placeholder: "Vendor"
                  }}
                />
              </div>

              <div className="pdp product-info">
                <ProductField
                  editable={this.editable}
                  fieldName="description"
                  fieldTitle="Description"
                  multiline={true}
                  onProductFieldChange={this.props.onProductFieldChange}
                  product={this.product}
                  textFieldProps={{
                    i18nKeyPlaceholder: "productDetailEdit.description",
                    placeholder: "Description"
                  }}
                />
              </div>
              {this.props.hasAdminPermission && <div className="digitalProduct"  style={{ marginLeft: "20px" }}>
                <div className="checkbox">
                  <h4><input id="digital" type="checkbox" value="" onChange={() => this.isDigital()} />Digital Product(Upload File or Enter Download Link)</h4>
                </div>
              </div>}

              {this.state.showDigital &&
                <div className="digitalProduct">
                  <div className="checkbox">
                  <div className="input-group"  style={{ width: "100%" }}>
                    <span className="input-group-addon">Url</span>
                    <input type="text" className="form-control" id="url" value={this.state.downloadUrl}
                      onChange={this.onDigitalChange} placeholder="Enter download url" />
                       <span className="input-group-btn">
                    <button id="save" className="form-control btn btn-success save" onClick={this.onDigitalSaveClick}>Save</button>
                    </span>
                     </div>
                  </div>
                   <div className="input-group"  style={{ width: "100%" }}>
                    <span className="input-group-addon">File(Limit: 100MB)</span>
                    <input type="file" className="form-control" id="file" />
                       <span className="input-group-btn">
                    <button id="upload" className="form-control btn btn-success save" onClick={this.fileUpload}>Upload</button>
                    </span>
                    </div>
                    <br />
                    {this.state.progressBar &&
                    <div className="progress">
                    <div className="progress-bar progress-bar-striped active" role="progressbar" style={{ width: `${this.state.progressLevel}%` }} >
                   Uploading </div>
                  </div> }
      
                </div>
              }
              <div className="options-add-to-cart">
                {this.props.topVariantComponent}
              </div>
              <hr />
              <div>
                <AlertContainer placement="productDetail" />
                <AddToCartButton
                  cartQuantity={this.props.cartQuantity}
                  onCartQuantityChange={this.props.onCartQuantityChange}
                  onClick={this.props.onAddToCart}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ProductDetail.propTypes = {
  cartQuantity: PropTypes.number,
  editable: PropTypes.bool,
  hasAdminPermission: PropTypes.bool,
  mediaGalleryComponent: PropTypes.node,
  onAddToCart: PropTypes.func,
  onCartQuantityChange: PropTypes.func,
  onDeleteProduct: PropTypes.func,
  onProductFieldChange: PropTypes.func,
  onViewContextChange: PropTypes.func,
  priceRange: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  product: PropTypes.object,
  socialComponent: PropTypes.node,
  tags: PropTypes.arrayOf(PropTypes.object),
  topVariantComponent: PropTypes.node,
  viewAs: PropTypes.string
};

export default ProductDetail;
