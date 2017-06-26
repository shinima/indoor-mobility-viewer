import React, { Component } from 'react'
import '../styles/MacList.styl'
import Test from '../components/test'

export default class MacList extends Component {

  deleteMac(macAddr) {
    this.props.deleteMac(macAddr)
  }

  addMac() {
    this.props.addMac()
  }

  render() {
    const { maclist } = this.props
    const colorList = ['#1F77B4', '#FF7F0E', '#2CA02C', '#d62728']
    return (
      <div className="mac-list">
        <div className="mac-title">
          <div className="mac-title-text">
            MAC地址管理
          </div>
          <div className="add-button">
            <button onClick={() => this.addMac()}>Add
            </button>
          </div>
        </div>
        <div className="mac-list-body">
          <table>
            <tbody>
              {maclist.map((mac, index) =>
                <tr key={index}>
                  <td className="color" style={{ background: `${colorList[0]}` }} />
                  <td className="mac-name">{mac.macName}</td>
                  <td className="del-button">
                    <button onClick={() => this.deleteMac(mac.macAddr)}>Del</button>
                  </td>
                  <td><input type="checkbox" className="checkbox" />
                  </td>
                </tr>
              ).toArray()}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}