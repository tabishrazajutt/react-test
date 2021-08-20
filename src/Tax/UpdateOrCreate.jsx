import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import urls from "../services/urls";
import { Formik, Field } from "formik";
import _ from "lodash";
import { useTaxes } from "../services/taxes-context";

const UpdateOrCreate = () => {
  const history = useHistory();
  const {
    state: { taxes },
    dispatch,
  } = useTaxes();
  const [id, setId] = useState(null);
  const [items, setItems] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const parts = window.location.pathname.split("/");
    const i = parseInt(parts[parts.length - 1]);
    if (i >= 0) {
      setId(i);
      if (taxes?.length) {
        if (taxes[i - 1]) {
          setCurrent(taxes[i - 1]);
        } else {
          history.push(urls.taxesIndex);
        }
      }
    }
  }, []);

  useEffect(() => {
    fetch("/data.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        return response.json();
      })
      .then((json) => {
        let data = [];
        json.map((j) => {
          if (j?.parent_id && j?.category?.name) {
            if (!data.find((d) => j.category.name === d.name)) {
              data.push({
                id: j.category.id,
                name: j.category.name,
                items: [j],
              });
            } else {
              let arr = _.cloneDeep(data);
              const idx = arr.findIndex((d) => j.category.name === d.name);
              arr[idx].items.push(j);
              data = arr;
            }
          } else {
            if (!data.find((d) => "Other" === d.name)) {
              data.push({ id: 0, name: "Other", items: [j] });
            } else {
              let arr = _.cloneDeep(data);
              const idx = arr.findIndex((d) => "Other" === d.name);
              arr[idx].items.push(j);
              data = arr;
            }
          }
        });
        setItems(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const _updateItems = (e, values, setFieldValue, item) => {
    const itemsArrParent = _.cloneDeep(values.applicable_items_parent);
    if (e.currentTarget.checked) {
      let idxP = itemsArrParent.findIndex((ia) => ia === item.id);
      if (idxP < 0) {
        itemsArrParent.push(item.id);
        setFieldValue("applicable_items_parent", itemsArrParent);
      }
      const itemsArr = _.cloneDeep(values.applicable_items);
      item.items.map((i) => {
        let idx = itemsArr.findIndex((ia) => ia === i.id);
        if (idx < 0) {
          itemsArr.push(i.id);
        }
      });
      setFieldValue("applicable_items", itemsArr);
    } else {
      let idxP = itemsArrParent.findIndex((ia) => ia === item.id);
      if (idxP >= 0) {
        itemsArrParent.splice(idxP, 1);
        setFieldValue("applicable_items_parent", itemsArrParent);
      }
      const itemsArr = _.cloneDeep(values.applicable_items);
      item.items.map((i) => {
        let idx = itemsArr.findIndex((ia) => ia === i.id);
        if (idx >= 0) {
          itemsArr.splice(idx, 1);
        }
      });
      setFieldValue("applicable_items", itemsArr);
    }
  };

  const _updateItem = (e, values, setFieldValue, item) => {
    const itemsArr = _.cloneDeep(values.applicable_items);
    if (e.currentTarget.checked) {
      let idx = itemsArr.findIndex((ia) => ia === item.id);
      if (idx < 0) {
        itemsArr.push(item.id);
        setFieldValue("applicable_items", itemsArr);
      }
    } else {
      let idx = itemsArr.findIndex((ia) => ia === item.id);
      if (idx >= 0) {
        itemsArr.splice(idx, 1);
        setFieldValue("applicable_items", itemsArr);
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-end mb-3">
        <Link className="btn btn-primary" to={urls.taxesIndex}>
          Back
        </Link>
      </div>
      <div className="card">
        <div className="card-header">{id ? "Edit" : "Add"} Tax</div>
        <div className="card-body">
          {console.log(current)}
          <Formik
            enableReinitialize={true}
            initialValues={{
              name: current?.name ?? "",
              rate: current?.rate ?? "",
              applied_to: current?.applied_to ?? "specific",
              applicable_items_parent: current?.applicable_items_parent ?? [],
              applicable_items: current?.applicable_items ?? [],
            }}
            validate={(values) => {
              const errors = {};
              if (!values.name) {
                errors.name = "Required";
              } else if (!values.rate) {
                errors.rate = "Required";
              } else if (!values.applied_to.length) {
                errors.applied_to = "Required";
              } else if (
                values.applied_to === "specific" &&
                !values.applicable_items.length
              ) {
                errors.applicable_items = "Required";
              }
              return errors;
            }}
            onSubmit={(values) => {
              const data = _.cloneDeep(values);
              if (data.applied_to === "all") {
                data.applicable_items_parent = items.map((i) => i.id);
                data.applicable_items = items
                  .map((i) => i.items.map((ii) => ii.id))
                  .flat(2);
              }
              let taxesArr = _.cloneDeep(taxes);
              if(id) {
                taxesArr[id - 1] = data;
              } else {
                taxesArr.push(data);
              }
              dispatch({ type: "taxes", payload: taxesArr });
              history.push(urls.taxesIndex);
            }}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleSubmit,
              isSubmitting,
              setFieldValue,
            }) => {
              return (
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="input-group mb-3">
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          id="name"
                          placeholder="Name"
                          onChange={handleChange}
                          value={values.name}
                        />
                        {errors.name && touched.name ? (
                          <div className="invalid-feedback d-block">
                            {errors.name}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="col-md-4 ms-md-3">
                      <div className="input-group mb-3">
                        <input
                          type="number"
                          className="form-control"
                          name="rate"
                          id="rate"
                          placeholder="Rate"
                          onChange={handleChange}
                          value={values.rate}
                        />
                        <span className="input-group-text">%</span>
                        {errors.rate && touched.rate ? (
                          <div className="invalid-feedback d-block">
                            {errors.rate}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="col-md-12 mb-3">
                      <div role="group" aria-labelledby="my-radio-group">
                        <label>
                          <Field
                            type="radio"
                            name="applied_to"
                            value="all"
                            className="me-2"
                          />
                          Apply to all items in collection
                        </label>
                        <label className="d-block mt-2">
                          <Field
                            type="radio"
                            name="applied_to"
                            value="specific"
                            className="me-2"
                          />
                          Apply to specific items
                        </label>
                      </div>
                      {errors.applied_to && touched.applied_to ? (
                        <div className="invalid-feedback d-block">
                          {errors.applied_to}
                        </div>
                      ) : null}
                    </div>
                    {values.applied_to === "specific" ? (
                      <div className="col-md-12 mt-3 mb-3">
                        {items.map((item, index) => {
                          return (
                            <div key={index}>
                              <label className="d-block p-2 bg-light mb-3">
                                <Field
                                  type="checkbox"
                                  name="applicable_items_parent"
                                  value={item.id}
                                  onChange={(e) =>
                                    _updateItems(e, values, setFieldValue, item)
                                  }
                                  className="me-2"
                                />
                                {item.name}
                              </label>
                              <div
                                role="group"
                                aria-labelledby="checkbox-group"
                                className="ps-5"
                              >
                                {item.items.map((ii, iiIdx) => {
                                  return (
                                    <label
                                      key={iiIdx}
                                      className="d-block p-2 mb-1"
                                    >
                                      <Field
                                        type="checkbox"
                                        name="applicable_items"
                                        value={ii.id}
                                        className="me-2"
                                        onChange={(e) =>
                                          _updateItem(
                                            e,
                                            values,
                                            setFieldValue,
                                            ii
                                          )
                                        }
                                      />
                                      {ii.name}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                        {errors.applicable_items && touched.applicable_items ? (
                          <div className="invalid-feedback d-block">
                            {errors.applicable_items}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="d-flex justify-content-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {id ? "Edit" : "Add"}
                    </button>
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default UpdateOrCreate;
