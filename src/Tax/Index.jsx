import React from "react";
import { Link } from "react-router-dom";
import urls from "../services/urls";
import { useTaxes } from "../services/taxes-context";

const Index = () => {
  const {state: { taxes }} = useTaxes();

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-end mb-3">
        <Link className="btn btn-primary" to={urls.taxesAdd}>
          Add Tax
        </Link>
      </div>
      <div className="card">
        <div className="card-header">Taxes</div>
        <div className="card-body table-responsive">
          <table className="table table-hover table-borderless">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Rate</th>
                <th>Items</th>
                <th>Applied To</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {taxes?.length ? (
                taxes.map((t, i) => {
                  return (
                    <tr key={i}>
                      <th>{i + 1}</th>
                      <td>{t.name}</td>
                      <td>{t.rate}%</td>
                      <td>{t.applicable_items?.length ? t.applicable_items.join(', ') : '-'}</td>
                      <td>{t.applied_to}</td>
                      <td>
                          <Link to={`${urls.taxesEdit}/${i+1}`} className="btn btn-sm btn-info text-white">Edit</Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-muted text-center">
                    No data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Index;
