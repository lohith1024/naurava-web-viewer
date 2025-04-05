/*
 * SPDX-FileCopyrightText: Copyright (c) 2024 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NvidiaProprietary
 *
 * NVIDIA CORPORATION, its affiliates and licensors retain all intellectual
 * property and proprietary rights in and to this material, related
 * documentation and any modifications thereto. Any use, reproduction,
 * disclosure or distribution of this material and related documentation
 * without an express license agreement from NVIDIA CORPORATION or
 * its affiliates is strictly prohibited.
 */

import { Component } from 'react';
import { getApplications, getApplicationVersions, getApplicationVersionProfiles } from './Endpoints';

const nextButtonStyle = {
    width: '200px',
    margin: '20px 15px 0px 0px',
};

const formContainerStyle = {
    margin: '20px auto',
    maxWidth: '800px',
    backgroundColor: '#1e1e1e',
    borderRadius: '8px',
    padding: '30px',
    color: '#ffffff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
};

const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '20px',
    gap: '10px'
};

export interface Application {
    id: string
    name: string
    version?: string
    profile?: string
}

interface AppOnlyProps {
    onNext: (state: any) => void;
}

interface AppOnlyState {
    useWebUI: boolean;
}

interface ServerURLsProps {
    onBack: (appServer: string, streamServer: string) => void;
    onNext: (appServer: string, streamServer: string, applications: Application[]) => void;
    appServer: string
    streamServer: string
}

interface ServerURLsState {
    applications: Application[];
    appServer: string,
    streamServer: string
}

interface ApplicationsProps {
    onBack: () => void;
    onNext: (applicationId: string, versions: string[]) => void;
    appServer: string,
    applications: Application[];
}

interface ApplicationsState {
    versions: string[];
    selectedApplication: Application;
}

interface VersionsProps {
    onBack: () => void;
    onNext: (selectedVersion: string, profiles: string[]) => void;
    appServer: string;
    applicationId: string;
    versions: string[];
}

interface VersionsState {
    profiles: string[];
    selectedVersion: string;
}

interface ProfilesProps {
    onBack: () => void;
    onNext: (applicationProfile: string) => void;
    profiles: string[];
}

interface ProfilesState {
    selectedProfile: string;
}


/**
 * Form for selecting if only the Kit application stream will load or if UI controls will be included.
 */
export class AppOnlyForm extends Component <AppOnlyProps, AppOnlyState>{
    constructor(props: AppOnlyProps) {
        super(props);

        this.state = {
            useWebUI: true
        }
    }
    
    private _handleOptionChange(value: boolean): void {
        this.setState({ useWebUI: value } );
    };

    render () {
        return (
            <div className="main-content">
                <div style={formContainerStyle}>
                    <h3 style={{ color: '#76b900', marginBottom: '20px' }}>UI Option</h3>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ marginBottom: '15px', display: 'block' }}>
                            This client is part of the <a
                                href="https://docs.omniverse.nvidia.com/embedded-web-viewer/latest/index.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#76b900' }}>
                                Embedded Web Viewer Guide
                            </a>.
                            It provides a user interface and functionality that supports Kit applications created from
                            the <b>USD Viewer</b> Template in the <a
                                href="https://github.com/NVIDIA-Omniverse/kit-app-template"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#76b900' }}>
                                kit-app-template
                            </a>.
                        </label>
                        <p style={{ marginBottom: '20px', opacity: '0.8' }}>
                            If you are using this client to stream any other application you need to select the 2nd option below in order for the streamed application to become visible.
                        </p>
                    </div>

                    <div className="form-check" style={{ marginBottom: '15px' }}>
                        <input
                            className="form-check-input"
                            type="radio"
                            name="webUiRadio"
                            checked={this.state.useWebUI}
                            id="yes"
                            onChange={() => this._handleOptionChange(true)}
                            style={{ marginRight: '10px' }}
                        />
                        <label className="form-check-label" htmlFor="yes">
                            UI for default streaming <b>USD Viewer</b> app
                        </label>
                    </div>
                    <div className="form-check" style={{ marginBottom: '20px' }}>
                        <input
                            className="form-check-input"
                            type="radio"
                            name="webUiRadio"
                            id="no"
                            checked={!this.state.useWebUI}
                            onChange={() => this._handleOptionChange(false)}
                            style={{ marginRight: '10px' }}
                        />
                        <label className="form-check-label" htmlFor="no">
                            UI for <b>any</b> streaming app
                        </label>
                    </div>
                    <div style={buttonContainerStyle}>
                        <button
                            type="button"
                            className="nvidia-button"
                            onClick={() => this.props.onNext(this.state)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

/**
* Form that contains the URLs for streaming
*
* @class ServerURLsForm
*/
export class ServerURLsForm extends Component <ServerURLsProps, ServerURLsState> {
    constructor(props: ServerURLsProps) {
        super(props);

        this.state = {
            appServer: this.props.appServer,
            streamServer: this.props.streamServer,
            applications: []
        };
    }

    private _onBack(): void {
        let appServer = (document.getElementById("app-server") as HTMLInputElement).value;
        let streamServer = (document.getElementById("stream-server") as HTMLInputElement).value;
        this.setState({ appServer: appServer, streamServer: streamServer })
        this.props.onBack(appServer, streamServer)
    }

    /**
     * Validation procedure for user-entered endpoints
     * 
     * @param endpoint - The endpoint URL
     * @returns true if validation succeeded, otherwise false
     */
    async _validateEndpoint(endpoint: string): Promise<boolean> {
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                mode: 'cors',
                headers: {'Content-Type': 'application/json'},
            });
    
            if (!response.ok) {
                console.error(`Error: Received status code ${response.status} from ${endpoint}`);
                alert(`Error: Unable to connect to ${endpoint.split('/').slice(0, 3).join('/')}`);
                return false;
            }
            return true;
        } catch (error) {
            console.error(`Error connecting to ${endpoint}:`, error);
            alert(`Error: Unable to connect to ${endpoint.split('/').slice(0, 3).join('/')}`);
            return false;
        }
    }

    /**
     * Executes when the 'next' button is clicked.
     */
    async _onNext() {
        let appServer = (document.getElementById("app-server") as HTMLInputElement).value.trim();
        let streamServer = (document.getElementById("stream-server") as HTMLInputElement).value.trim();
        
        // Validate inputs
        if (!appServer) {
            alert("An App Server must be entered.");
            return;
        }

        if (!streamServer) {
            alert("A Stream Server must be entered.");
            return;
        }

        // Add protocol if missing
        if (!appServer.startsWith('http')) {
            appServer = `http://${appServer}`;
        }
        if (!streamServer.startsWith('http')) {
            streamServer = `http://${streamServer}`;
        }

        // Validate URLs
        try {
            new URL(appServer);
            new URL(streamServer);
        } catch (err) {
            alert("Please enter valid URLs for both servers");
            return;
        }

        // Validate connections
        const appEndpoint = `${appServer}/cfg/apps`;
        const streamEndpoint = `${streamServer}/streaming/stream`;
        
        if (!await this._validateEndpoint(appEndpoint)) {
            return;
        }

        if (!await this._validateEndpoint(streamEndpoint)) {
            return;
        }

        try {
            await this._loadApplications(appServer);
            
            this.setState((prevState) => {
                if (!prevState.applications || prevState.applications.length === 0) {
                    alert(`No applications were found from App Server ${appServer}`);
                    return;
                }
                this.props.onNext(appServer, streamServer, prevState.applications);
            });
        } catch (error) {
            console.error('Error loading applications:', error);
            alert('Failed to load applications. Please check your connection and try again.');
        }
    }

    private _loadApplications = async (appServer: string) => {
        try {
            const response = await getApplications(appServer);
            if (response.status === 200 && response.data) {
                const applications = Object.values(response.data);
                if (applications.length === 0) {
                    throw new Error('No applications found');
                }
                this.setState(prevState => ({ ...prevState, applications }));
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Error loading applications:', error);
            throw error;
        }
    };

    render() {
        return (
            <div className="main-content">
                <div style={formContainerStyle}>
                    <h3 style={{ color: '#76b900', marginBottom: '20px' }}>Server Information</h3>
                    <div className="mb-4">
                        <div className="row align-items-center mb-4">
                            <div className="col-12 col-md-3">
                                <label htmlFor="app-server" className="form-label">App Server</label>
                            </div>
                            <div className="col-12 col-md-9">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="app-server"
                                    placeholder="Enter App Server"
                                    defaultValue={this.state.appServer}
                                    style={{
                                        backgroundColor: '#2a2a2a',
                                        border: '1px solid #333333',
                                        color: '#ffffff',
                                        padding: '10px',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="row align-items-center">
                            <div className="col-12 col-md-3">
                                <label htmlFor="stream-server" className="form-label">Stream Server</label>
                            </div>
                            <div className="col-12 col-md-9">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="stream-server"
                                    placeholder="Enter Stream Server"
                                    defaultValue={this.state.streamServer}
                                    style={{
                                        backgroundColor: '#2a2a2a',
                                        border: '1px solid #333333',
                                        color: '#ffffff',
                                        padding: '10px',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div style={buttonContainerStyle}>
                        <button type="button" className="nvidia-button" onClick={() => this._onBack()}>Previous</button>
                        <button type="button" className="nvidia-button" onClick={() => this._onNext()}>Next</button>
                    </div>
                </div>
            </div>
        )
    }
}

/**
* Form that allows a user to select an application
*
* @class ApplicationsForm
*/
export class ApplicationsForm extends Component<ApplicationsProps, ApplicationsState> {
    constructor(props: ApplicationsProps) {
        super(props);

        this.state = {
            selectedApplication: this.props.applications[0],
            versions: []
        };
    }

    /**
     * Executes when the 'next' button is clicked.
     */
    async _onNext() {
        const selectedAppId: string = this.state.selectedApplication.id

        await this._loadVersions(this.props.appServer, selectedAppId)
        this.setState((prevState) => {
            if (prevState.versions.length === 0) {
                alert(`No versions were found from Application with id ${selectedAppId}`)
                return
                
            }
            else {
                this.props.onNext(prevState.selectedApplication.id, prevState.versions)
            }
        });
    }
    
    /**
     * Queries available application versions for the provided app server and app id
     * 
     * @param appServer - The app server URL
     * @param appId - The application id
     */
    private _loadVersions = async (appServer: string, appId: string) => {
        const response = await getApplicationVersions(appServer, appId);
        if (response.status === 200) {
            this.setState(prevState => ({ ...prevState, versions: response.data.versions}));
        }
    };
    
    /**
     * Executes when a user selects an application item from the dropdown
     */
    handleSelectChange = (event: any) => {
        const selectedAppId = event.target.value;
        const selectedApplication = this.props.applications.find((app) => app.id === selectedAppId);

        if (!selectedApplication)
            throw new Error(`Application with id ${selectedAppId} not found`);

        this.setState({ selectedApplication: selectedApplication });
    };

    render() {
        return (
            <div className="main-content">
                <div style={formContainerStyle}>
                    <h3 style={{ color: '#76b900', marginBottom: '20px' }}>Select Application</h3>
                    <div style={{ marginBottom: '20px' }}>
                        {this.props.applications.map((app, index) => (
                            <div key={index} className="form-check" style={{ marginBottom: '15px' }}>
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="applicationRadio"
                                    id={`app-${index}`}
                                    checked={this.state.selectedApplication === app}
                                    onChange={() => this.handleSelectChange({ target: { value: app.id } })}
                                    style={{ marginRight: '10px' }}
                                />
                                <label className="form-check-label" htmlFor={`app-${index}`}>
                                    {app.name}
                                </label>
                            </div>
                        ))}
                    </div>
                    <div style={buttonContainerStyle}>
                        <button type="button" className="nvidia-button" onClick={() => this.props.onBack()}>Previous</button>
                        <button
                            type="button"
                            className="nvidia-button"
                            onClick={() => this._onNext()}
                            disabled={!this.state.selectedApplication}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

/**
* Form that allows a user to select an application version
*
* @class VersionsForm
*/
export class VersionsForm extends Component<VersionsProps, VersionsState> {
    constructor(props: VersionsProps) {
        super(props);

        this.state = {
            selectedVersion: this.props.versions[0],
            profiles: []
        };
    }

    /**
     * Executes when the 'next' button is clicked.
     */
    async _onNext() {
        const selectedVersion: string = this.state.selectedVersion

        await this._loadProfiles(this.props.applicationId, selectedVersion)

        this.setState((prevState) => {
            if (prevState.profiles.length === 0) {
                alert(`No profiles were found for Application version ${selectedVersion}`)
                return
                
            }
            else {
                this.props.onNext(prevState.selectedVersion, prevState.profiles)
            }
        });
    }

    /**
     * Queries available profiles versions for the provided app id and version
     * 
     * @param appServer - The app server URL
     * @param appId - The application id
     */
    private _loadProfiles = async (appId: string, version: string) => {
        const response = await getApplicationVersionProfiles(this.props.appServer, appId, version);
        if (response.status === 200) {
            this.setState(prevState => ({ ...prevState, profiles: response.data.profiles.map(p => p.id)}));
        }
    };

    /**
     * Executes when a user selects a version item from the dropdown
     */
    handleSelectChange = (event: any) => {
        const selectedVersion = event.target.value;
        this.setState({ selectedVersion: selectedVersion });
    };


    render() {
        return (
            <div className="main-content">
                <div style={formContainerStyle}>
                    <h3 style={{ color: '#76b900', marginBottom: '20px' }}>Select Version</h3>
                    <div style={{ marginBottom: '20px' }}>
                        {this.props.versions.map((version, index) => (
                            <div key={index} className="form-check" style={{ marginBottom: '15px' }}>
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="versionRadio"
                                    id={`version-${index}`}
                                    checked={this.state.selectedVersion === version}
                                    onChange={() => this.handleSelectChange({ target: { value: version } })}
                                    style={{ marginRight: '10px' }}
                                />
                                <label className="form-check-label" htmlFor={`version-${index}`}>
                                    {version}
                                </label>
                            </div>
                        ))}
                    </div>
                    <div style={buttonContainerStyle}>
                        <button type="button" className="nvidia-button" onClick={() => this.props.onBack()}>Previous</button>
                        <button
                            type="button"
                            className="nvidia-button"
                            onClick={() => this._onNext()}
                            disabled={!this.state.selectedVersion}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

/**
* Form that allows a user to select an application profile
*
* @class ProfilesForm
*/
export class ProfilesForm extends Component<ProfilesProps, ProfilesState> {
    constructor(props: ProfilesProps) {
        super(props);

        this.state = {
            selectedProfile: this.props.profiles[0]
        };
    }

    /**
     * Executes when the 'next' button is clicked.
     */
    async _onNext() {
        this.props.onNext(this.state.selectedProfile)
    }

    /**
     * Executes when a user selects a profile item from the dropdown
     */
    handleSelectChange = (event: any) => {
        const selectedProfile = event.target.value;
        this.setState({ selectedProfile: selectedProfile });
        
    };

    render() {
        return (
            <div className="main-content">
                <div style={formContainerStyle}>
                    <h3 style={{ color: '#76b900', marginBottom: '20px' }}>Select Profile</h3>
                    <div style={{ marginBottom: '20px' }}>
                        {this.props.profiles.map((profile, index) => (
                            <div key={index} className="form-check" style={{ marginBottom: '15px' }}>
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="profileRadio"
                                    id={`profile-${index}`}
                                    checked={this.state.selectedProfile === profile}
                                    onChange={() => this.handleSelectChange({ target: { value: profile } })}
                                    style={{ marginRight: '10px' }}
                                />
                                <label className="form-check-label" htmlFor={`profile-${index}`}>
                                    {profile}
                                </label>
                            </div>
                        ))}
                    </div>
                    <div style={buttonContainerStyle}>
                        <button type="button" className="nvidia-button" onClick={() => this.props.onBack()}>Previous</button>
                        <button
                            type="button"
                            className="nvidia-button"
                            onClick={() => this._onNext()}
                            disabled={!this.state.selectedProfile}
                        >
                            Start
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
